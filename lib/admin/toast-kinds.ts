// Pure data + parser shared between server admin pages (which read the
// ?toast= search param) and the client AdminActionToast component (which
// renders the resulting toast). Lives outside any "use client" file so
// the server can import it without React Server Components yelling about
// crossing the client/server boundary.

export const ADMIN_TOAST_COPY = {
  captain_approved: {
    prefix: "Captain application",
    body: "was approved.",
  },
  captain_dismissed: {
    prefix: "Captain application",
    body: "was dismissed.",
  },
  captain_revoked: {
    prefix: "Captain status",
    body: "was revoked.",
  },
  league_ops_approved: {
    prefix: "League ops application",
    body: "was approved.",
  },
  league_ops_dismissed: {
    prefix: "League ops application",
    body: "was dismissed.",
  },
  player_pool_updated: {
    prefix: "Player pool",
    body: "selection was updated.",
  },
  player_admin_updated: {
    prefix: "League ops access",
    body: "was updated.",
  },
  announcement_published: {
    prefix: "Announcement",
    body: "was published and is live.",
  },
  announcement_drafted: {
    prefix: "Announcement",
    body: "was saved as a draft.",
  },
  announcement_deleted: {
    prefix: "Announcement",
    body: "was deleted.",
  },
  announcement_pin_updated: {
    prefix: "Announcement pin",
    body: "was updated.",
  },
} as const;

export type AdminToastKind = keyof typeof ADMIN_TOAST_COPY;

export function parseAdminToastKind(value: unknown): AdminToastKind | null {
  return typeof value === "string" && value in ADMIN_TOAST_COPY
    ? (value as AdminToastKind)
    : null;
}
