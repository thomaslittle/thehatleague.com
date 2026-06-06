import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export interface PersonCard {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export interface FriendRequestCard extends PersonCard {
  friendshipId: string;
}

const PROFILE_COLS =
  "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, is_admin";

interface ProfileRow {
  id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  profile_avatar_url: string | null;
  is_admin: boolean | null;
}

function toCard(p: ProfileRow): PersonCard {
  return {
    id: p.id,
    name: p.discord_global_name ?? p.discord_username ?? "Player",
    username: p.discord_username,
    avatarUrl: p.profile_avatar_url ?? p.discord_avatar_url,
    isAdmin: p.is_admin ?? false,
  };
}

/** Fetch profile cards for a set of ids in one query (deduped, name-sorted). */
async function cardsByIds(supabase: ServerClient, ids: string[]): Promise<PersonCard[]> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return [];
  const { data } = await supabase.from("profiles").select(PROFILE_COLS).in("id", unique);
  return ((data ?? []) as ProfileRow[]).map(toCard).sort((a, b) => a.name.localeCompare(b.name));
}

/** Match either direction of a friendship between two profiles. */
function pairFilter(a: string, b: string): string {
  return `and(requester_id.eq.${a},addressee_id.eq.${b}),and(requester_id.eq.${b},addressee_id.eq.${a})`;
}

/** Accepted friends of the current user (RLS already scopes rows to them). */
export async function loadFriends(userId: string): Promise<PersonCard[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted");
  const otherIds = (data ?? []).map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id));
  return cardsByIds(supabase, otherIds);
}

/** Pending requests, split into incoming (to act on) and outgoing (to cancel). */
export async function loadFriendRequests(
  userId: string,
): Promise<{ incoming: FriendRequestCard[]; outgoing: FriendRequestCard[] }> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id")
    .eq("status", "pending");
  const rows = data ?? [];
  const incomingRaw = rows
    .filter((r) => r.addressee_id === userId)
    .map((r) => ({ friendshipId: r.id, otherId: r.requester_id }));
  const outgoingRaw = rows
    .filter((r) => r.requester_id === userId)
    .map((r) => ({ friendshipId: r.id, otherId: r.addressee_id }));

  const cards = await cardsByIds(supabase, [...incomingRaw, ...outgoingRaw].map((x) => x.otherId));
  const byId = new Map(cards.map((c) => [c.id, c]));
  const join = (raw: { friendshipId: string; otherId: string }[]): FriendRequestCard[] =>
    raw
      .map((x) => {
        const card = byId.get(x.otherId);
        return card ? { ...card, friendshipId: x.friendshipId } : null;
      })
      .filter((x): x is FriendRequestCard => x !== null);

  return { incoming: join(incomingRaw), outgoing: join(outgoingRaw) };
}

export interface ProfileSocial {
  status: "self" | "none" | "friends" | "incoming" | "outgoing";
  friendshipId: string | null;
  /** Friends OR teammates — the gate for starting a DM. */
  canMessage: boolean;
}

/** Relationship between the viewer and another profile, for profile-page actions. */
export async function loadProfileSocial(viewerId: string, otherId: string): Promise<ProfileSocial> {
  if (viewerId === otherId) return { status: "self", friendshipId: null, canMessage: false };
  const supabase = await createSupabaseServerClient();

  const { data: fr } = await supabase
    .from("friendships")
    .select("id, status, addressee_id")
    .or(pairFilter(viewerId, otherId))
    .maybeSingle();

  let status: ProfileSocial["status"] = "none";
  let friendshipId: string | null = null;
  let friends = false;
  if (fr) {
    friendshipId = fr.id;
    if (fr.status === "accepted") {
      status = "friends";
      friends = true;
    } else {
      status = fr.addressee_id === viewerId ? "incoming" : "outgoing";
    }
  }

  let teammate = false;
  if (!friends) {
    const { data: mine } = await supabase.from("team_members").select("team_id").eq("profile_id", viewerId);
    const teamIds = (mine ?? []).map((m) => m.team_id);
    if (teamIds.length) {
      const { count } = await supabase
        .from("team_members")
        .select("team_id", { count: "exact", head: true })
        .eq("profile_id", otherId)
        .in("team_id", teamIds);
      teammate = (count ?? 0) > 0;
    }
  }

  return { status, friendshipId, canMessage: friends || teammate };
}

// League runs on US Eastern (see /schedule) — format message times consistently there.
const LEAGUE_TZ = "America/New_York";

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: LEAGUE_TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

function agoLabel(iso: string | null): string | null {
  if (!iso) return null;
  const secs = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "now";
  const m = Math.round(secs / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString("en-US", { timeZone: LEAGUE_TZ, month: "short", day: "numeric" });
}

// ── Conversations (DM + team chat) ────────────────────────────────────────

export interface ConversationSummary {
  id: string;
  kind: "dm" | "team";
  title: string;
  avatarUrl: string | null;
  color: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastActivityLabel: string | null;
  unread: number;
}

interface TeamLite {
  name: string;
  color: string | null;
  slug: string;
}

async function loadDmOthers(
  supabase: ServerClient,
  convIds: string[],
  userId: string,
): Promise<Map<string, PersonCard>> {
  if (convIds.length === 0) return new Map();
  const { data } = await supabase
    .from("conversation_participants")
    .select("conversation_id, profile_id")
    .in("conversation_id", convIds);
  const rows = (data ?? []).filter((r) => r.profile_id !== userId);
  const cards = await cardsByIds(supabase, rows.map((r) => r.profile_id));
  const byId = new Map(cards.map((c) => [c.id, c]));
  const map = new Map<string, PersonCard>();
  for (const r of rows) {
    const card = byId.get(r.profile_id);
    if (card) map.set(r.conversation_id, card);
  }
  return map;
}

async function loadTeamMap(supabase: ServerClient, teamIds: string[]): Promise<Map<string, TeamLite>> {
  const unique = [...new Set(teamIds)];
  if (unique.length === 0) return new Map();
  const { data } = await supabase.from("teams").select("id, name, color, slug").in("id", unique);
  return new Map((data ?? []).map((t) => [t.id, { name: t.name, color: t.color, slug: t.slug }]));
}

/** The current user's inbox — DMs and team channels, newest first, with unread counts. */
export async function loadConversations(userId: string): Promise<ConversationSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data: convs } = await supabase
    .from("conversations")
    .select("id, kind, team_id, last_message_at")
    .order("last_message_at", { ascending: false, nullsFirst: false });
  const list = convs ?? [];
  if (list.length === 0) return [];
  const ids = list.map((c) => c.id);

  const [readsRes, msgsRes, dmOthers, teamMap] = await Promise.all([
    supabase.from("conversation_reads").select("conversation_id, last_read_at"),
    supabase
      .from("messages")
      .select("conversation_id, sender_id, body, created_at")
      .in("conversation_id", ids)
      .order("created_at", { ascending: false }),
    loadDmOthers(supabase, list.filter((c) => c.kind === "dm").map((c) => c.id), userId),
    loadTeamMap(
      supabase,
      list.filter((c) => c.kind === "team" && c.team_id).map((c) => c.team_id as string),
    ),
  ]);

  const readMap = new Map((readsRes.data ?? []).map((r) => [r.conversation_id, r.last_read_at]));
  const lastBody = new Map<string, string>();
  const unread = new Map<string, number>();
  for (const m of msgsRes.data ?? []) {
    if (!lastBody.has(m.conversation_id)) lastBody.set(m.conversation_id, m.body);
    const lr = readMap.get(m.conversation_id);
    if (m.sender_id !== userId && (!lr || m.created_at > lr)) {
      unread.set(m.conversation_id, (unread.get(m.conversation_id) ?? 0) + 1);
    }
  }

  return list.map((c) => {
    const team = c.kind === "team" && c.team_id ? teamMap.get(c.team_id) : null;
    const other = c.kind === "dm" ? dmOthers.get(c.id) : null;
    return {
      id: c.id,
      kind: c.kind as "dm" | "team",
      title: c.kind === "team" ? team?.name ?? "Team chat" : other?.name ?? "Direct message",
      avatarUrl: other?.avatarUrl ?? null,
      color: team?.color ?? null,
      lastMessage: lastBody.get(c.id) ?? null,
      lastMessageAt: c.last_message_at,
      lastActivityLabel: agoLabel(c.last_message_at),
      unread: unread.get(c.id) ?? 0,
    };
  });
}

export interface MessageView {
  id: string;
  body: string;
  createdAt: string;
  timeLabel: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  mine: boolean;
}

export interface ConversationView {
  id: string;
  kind: "dm" | "team";
  title: string;
  subtitle: string | null;
  avatarUrl: string | null;
  color: string | null;
  otherId: string | null;
  teamSlug: string | null;
  messages: MessageView[];
}

/** Full thread for a conversation, or null if the user can't access it (RLS). */
export async function loadConversation(
  userId: string,
  conversationId: string,
): Promise<ConversationView | null> {
  const supabase = await createSupabaseServerClient();
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, kind, team_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return null;

  let title = "";
  let subtitle: string | null = null;
  let avatarUrl: string | null = null;
  let color: string | null = null;
  let otherId: string | null = null;
  let teamSlug: string | null = null;

  if (conv.kind === "team" && conv.team_id) {
    const { data: t } = await supabase
      .from("teams")
      .select("name, color, slug")
      .eq("id", conv.team_id)
      .maybeSingle();
    title = t?.name ?? "Team chat";
    subtitle = "Team chat";
    color = t?.color ?? null;
    teamSlug = t?.slug ?? null;
  } else {
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("profile_id")
      .eq("conversation_id", conversationId);
    const otherIds = (parts ?? []).map((p) => p.profile_id).filter((id) => id !== userId);
    const cards = await cardsByIds(supabase, otherIds);
    const other = cards[0];
    title = other?.name ?? "Direct message";
    subtitle = other?.username ? `@${other.username}` : null;
    avatarUrl = other?.avatarUrl ?? null;
    otherId = other?.id ?? null;
  }

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  const senderCards = await cardsByIds(supabase, (msgs ?? []).map((m) => m.sender_id));
  const byId = new Map(senderCards.map((c) => [c.id, c]));
  const messages: MessageView[] = (msgs ?? []).map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.created_at,
    timeLabel: timeLabel(m.created_at),
    senderId: m.sender_id,
    senderName: byId.get(m.sender_id)?.name ?? "Player",
    senderAvatarUrl: byId.get(m.sender_id)?.avatarUrl ?? null,
    mine: m.sender_id === userId,
  }));

  return {
    id: conv.id,
    kind: conv.kind as "dm" | "team",
    title,
    subtitle,
    avatarUrl,
    color,
    otherId,
    teamSlug,
    messages,
  };
}

/**
 * Lightweight unread-message + pending-friend-request counts for the header
 * badges. Skips the DM/team enrichment that `loadConversations` does, since this
 * runs on every page via `getViewer`.
 */
export async function loadSocialCounts(
  userId: string,
): Promise<{ unreadMessages: number; friendRequests: number }> {
  const supabase = await createSupabaseServerClient();
  const [convsRes, readsRes, reqRes] = await Promise.all([
    supabase.from("conversations").select("id"),
    supabase.from("conversation_reads").select("conversation_id, last_read_at"),
    supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .eq("addressee_id", userId),
  ]);

  const convIds = (convsRes.data ?? []).map((c) => c.id);
  let unreadMessages = 0;
  if (convIds.length) {
    const readMap = new Map((readsRes.data ?? []).map((r) => [r.conversation_id, r.last_read_at]));
    const { data: msgs } = await supabase
      .from("messages")
      .select("conversation_id, sender_id, created_at")
      .in("conversation_id", convIds);
    for (const m of msgs ?? []) {
      const lr = readMap.get(m.conversation_id);
      if (m.sender_id !== userId && (!lr || m.created_at > lr)) unreadMessages += 1;
    }
  }

  return { unreadMessages, friendRequests: reqRes.count ?? 0 };
}
