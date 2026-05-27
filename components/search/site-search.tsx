"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { queryKeys } from "@/lib/query-keys";
import { NAV_PRIMARY } from "@/lib/site";
import { cleanDiscordUsername } from "@/lib/discord/name";

interface SearchablePlayer {
  id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  profile_avatar_url: string | null;
  is_captain: boolean | null;
}

const PAGE_GROUP: { label: string; href: string; hint?: string }[] = [
  { label: "Landing", href: "/", hint: "Home" },
  ...NAV_PRIMARY.map((n) => ({ label: n.label, href: n.href })),
  { label: "Replays", href: "/replays" },
  { label: "Rules", href: "/rules" },
  { label: "Announcements", href: "/announcements" },
  { label: "Leaderboards", href: "/leaderboards" },
  { label: "MVP vote", href: "/mvp" },
];

const ACCOUNT_GROUP_AUTHED: { label: string; href: string; hint?: string }[] = [
  { label: "Dashboard", href: "/dashboard", hint: "Your hub" },
  { label: "Settings", href: "/settings", hint: "Profile & ranks" },
];

const ACCOUNT_GROUP_ANON: { label: string; href: string; hint?: string }[] = [
  { label: "Sign in", href: "/signin", hint: "Discord OAuth" },
];

const ADMIN_GROUP: { label: string; href: string; hint?: string }[] = [
  { label: "Admin overview", href: "/admin", hint: "League ops" },
  { label: "Captains queue", href: "/admin/captains" },
  { label: "League-ops queue", href: "/admin/league-ops" },
  { label: "Manage players", href: "/admin/players" },
  { label: "Announcements", href: "/admin/announcements" },
  { label: "OG preview", href: "/admin/og-preview" },
];

export function SiteSearch({
  isAuthenticated,
  isAdmin,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // EFFECT JUSTIFICATION: global keyboard shortcut + cross-OS mac/win
  // detection. No reactive way to bind window keyup.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { data: players = [] } = useQuery<SearchablePlayer[]>({
    // Distinct from playerPool.full() — we want every signed-up
    // profile, in-pool or not, for the global search.
    queryKey: ["search", "players"],
    enabled: open,
    staleTime: 60_000,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, is_captain",
        )
        .order("discord_username", { ascending: true });
      return (data ?? []) as SearchablePlayer[];
    },
  });

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <SearchTrigger onClick={() => setOpen(true)} />

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search players, pages, league ops…" />
        <CommandList>
          <CommandEmpty>No matches. Try a shorter query.</CommandEmpty>

          <CommandGroup heading="Pages">
            {PAGE_GROUP.map((p) => (
              <CommandItem
                key={p.href}
                value={`${p.label} ${p.href}`}
                onSelect={() => navigate(p.href)}
              >
                <PageGlyph />
                <span>{p.label}</span>
                {p.hint && (
                  <span className="ml-2 text-xs font-normal text-neutral-500">
                    {p.hint}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />
          <CommandGroup heading="Account">
            {(isAuthenticated ? ACCOUNT_GROUP_AUTHED : ACCOUNT_GROUP_ANON).map(
              (item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${item.href}`}
                  onSelect={() => navigate(item.href)}
                >
                  <PageGlyph />
                  <span>{item.label}</span>
                  {item.hint && (
                    <span className="ml-2 text-xs font-normal text-neutral-500">
                      {item.hint}
                    </span>
                  )}
                </CommandItem>
              ),
            )}
          </CommandGroup>

          {isAdmin && (
            <>
              <CommandSeparator />
              <CommandGroup heading="League ops">
                {ADMIN_GROUP.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${item.label} ${item.href}`}
                    onSelect={() => navigate(item.href)}
                  >
                    <ShieldGlyph />
                    <span>{item.label}</span>
                    {item.hint && (
                      <span className="ml-2 text-xs font-normal text-neutral-500">
                        {item.hint}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {players.length > 0 && (
            <>
              <CommandSeparator />
              <PlayerResults players={players} onPick={navigate} />
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

function PlayerResults({
  players,
  onPick,
}: {
  players: SearchablePlayer[];
  onPick: (href: string) => void;
}) {
  // cmdk filters using each item's `value`. We pre-compute a flat
  // "name handle" string so typing either matches.
  const rows = useMemo(
    () =>
      players
        .map((p) => {
          const handle = cleanDiscordUsername(p.discord_username);
          if (!handle) return null;
          const name = p.discord_global_name ?? handle;
          return { id: p.id, handle, name, p };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null),
    [players],
  );
  if (rows.length === 0) return null;
  return (
    <CommandGroup heading={`Players · ${rows.length}`}>
      {rows.map(({ id, handle, name, p }) => {
        const href = `/players/${encodeURIComponent(handle)}`;
        const avatarUrl = p.profile_avatar_url ?? p.discord_avatar_url;
        return (
          <CommandItem
            key={id}
            value={`${name} ${handle}`}
            onSelect={() => onPick(href)}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={20}
                height={20}
                unoptimized
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-thl-orange text-[9px] font-extrabold text-black">
                {name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="truncate">{name}</span>
            <span className="ml-1 truncate text-xs font-normal text-neutral-500">
              @{handle}
            </span>
            {p.is_captain && (
              <span className="ml-2 rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase">
                Captain
              </span>
            )}
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}

function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Search the league"
      title="Search (⌘K)"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:text-thl-orange dark:text-neutral-400 dark:hover:text-thl-orange"
    >
      <SearchGlyph className="h-[14px] w-[14px]" />
    </button>
  );
}

function PageGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-neutral-400"
      aria-hidden
    >
      <path d="M14 3v5h5M7 3h7l5 5v13H7z" />
    </svg>
  );
}

function ShieldGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-thl-orange"
      aria-hidden
    >
      <path d="M12 2 4 5v6c0 4.97 3.4 9.55 8 11 4.6-1.45 8-6.03 8-11V5l-8-3Z" />
    </svg>
  );
}

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
