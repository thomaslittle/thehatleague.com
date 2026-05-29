import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { searchPlayers } from "@/server/pool";

interface PageEntry {
  label: string;
  to: string;
  hint?: string;
}

type ViewerLite = {
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const PAGES: PageEntry[] = [
  { label: "Landing", to: "/", hint: "Home" },
  { label: "The Draft", to: "/the-draft" },
  { label: "Standings", to: "/standings" },
  { label: "Leaderboards", to: "/leaderboards" },
  { label: "Schedule", to: "/schedule" },
  { label: "Captains", to: "/captains" },
  { label: "Clips", to: "/clips" },
  { label: "Rules", to: "/rules" },
  { label: "MVP", to: "/mvp" },
  { label: "Pool", to: "/pool" },
  { label: "Replays", to: "/replays" },
  { label: "About", to: "/about" },
];

const AUTHED: PageEntry[] = [
  { label: "Dashboard", to: "/dashboard", hint: "Your hub" },
  { label: "Onboarding", to: "/onboarding", hint: "Profile & ranks" },
];

const ANON: PageEntry[] = [
  { label: "Sign in", to: "/signin", hint: "Discord OAuth" },
];

const ADMIN: PageEntry[] = [
  { label: "Captains queue", to: "/admin/captains", hint: "Approve apps" },
  { label: "League-ops queue", to: "/admin/league-ops", hint: "Approve apps" },
  { label: "Manage players", to: "/admin/players" },
  { label: "Announcements", to: "/admin/announcements" },
  { label: "OG preview", to: "/admin/og-preview" },
];

type SearchResult = Awaited<ReturnType<typeof searchPlayers>>;

export function SiteSearch({ viewer }: { viewer: ViewerLite }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // EFFECT JUSTIFICATION: global Cmd+K shortcut. There's no reactive way
  // to bind a window keydown listener — the listener has to register on
  // the DOM and clean up on unmount.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((p) => !p);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus the input when the dialog opens. Tiny one-shot, no fanout —
  // marked as a justified effect per the PRD's state-management rules.
  useEffect(() => {
    if (open) {
      // Delay one tick so the input is mounted before focus.
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    } else {
      setQ("");
    }
  }, [open]);

  const { data: players = [], isFetching } = useQuery<SearchResult>({
    queryKey: ["site-search", q],
    queryFn: () => searchPlayers({ data: { q } }),
    enabled: open && q.trim().length > 0,
    staleTime: 30_000,
  });

  const filteredPages = useMemo(() => {
    if (!q.trim()) return PAGES;
    const needle = q.toLowerCase();
    return PAGES.filter((p) => p.label.toLowerCase().includes(needle));
  }, [q]);

  const filteredAdmin = useMemo(() => {
    if (!viewer.isAdmin) return [];
    if (!q.trim()) return ADMIN;
    const needle = q.toLowerCase();
    return ADMIN.filter((p) => p.label.toLowerCase().includes(needle));
  }, [q, viewer.isAdmin]);

  const accountGroup = viewer.isAuthenticated ? AUTHED : ANON;

  function go(to: string) {
    setOpen(false);
    // TanStack's navigate accepts an arbitrary path via `href`; using `to`
    // would require typed-route narrowing per entry which is overkill for
    // a search palette.
    navigate({ href: to });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search (Cmd+K)"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-thl-orange dark:hover:bg-neutral-900"
      >
        <SearchIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
        >
          <div
            onClick={() => setOpen(false)}
            aria-hidden
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <SearchIcon className="h-4 w-4 shrink-0 text-neutral-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search pages and players…"
                className="w-full bg-transparent text-base text-neutral-900 placeholder:text-neutral-400 outline-none sm:text-sm dark:text-white"
              />
              <kbd className="hidden rounded border border-neutral-300 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase sm:inline-flex dark:border-neutral-700">
                Esc
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {q.trim() && players.length > 0 && (
                <Group label="Players">
                  {players.map((p) => {
                    const name =
                      p.discord_global_name ?? p.discord_username ?? "Unnamed";
                    const avatar =
                      p.profile_avatar_url ?? p.discord_avatar_url;
                    return (
                      <Row
                        key={p.id}
                        onSelect={() =>
                          p.discord_username &&
                          go(`/players/${encodeURIComponent(p.discord_username)}`)
                        }
                      >
                        {avatar ? (
                          <img
                            src={avatar}
                            alt=""
                            className="h-7 w-7 rounded-full"
                          />
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-thl-orange text-[10px] font-bold text-black">
                            {name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="truncate font-medium">{name}</span>
                        {p.is_captain && (
                          <span className="rounded bg-thl-orange/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase">
                            Captain
                          </span>
                        )}
                        {p.peak_rank && (
                          <span className="ml-auto truncate text-xs text-neutral-500">
                            Peak {p.peak_rank}
                          </span>
                        )}
                      </Row>
                    );
                  })}
                </Group>
              )}

              {q.trim() &&
                isFetching &&
                players.length === 0 &&
                q.trim().length > 0 && (
                  <div className="px-3 py-6 text-center text-xs text-neutral-500">
                    Searching…
                  </div>
                )}

              {filteredPages.length > 0 && (
                <Group label="Pages">
                  {filteredPages.map((p) => (
                    <Row key={p.to} onSelect={() => go(p.to)}>
                      <span className="font-medium">{p.label}</span>
                      {p.hint && (
                        <span className="ml-auto text-xs text-neutral-500">
                          {p.hint}
                        </span>
                      )}
                    </Row>
                  ))}
                </Group>
              )}

              {filteredAdmin.length > 0 && (
                <Group label="Admin">
                  {filteredAdmin.map((p) => (
                    <Row key={p.to} onSelect={() => go(p.to)}>
                      <span className="font-medium">{p.label}</span>
                      {p.hint && (
                        <span className="ml-auto text-xs text-neutral-500">
                          {p.hint}
                        </span>
                      )}
                    </Row>
                  ))}
                </Group>
              )}

              <Group label="Account">
                {accountGroup.map((p) => (
                  <Row key={p.to} onSelect={() => go(p.to)}>
                    <span className="font-medium">{p.label}</span>
                    {p.hint && (
                      <span className="ml-auto text-xs text-neutral-500">
                        {p.hint}
                      </span>
                    )}
                  </Row>
                ))}
              </Group>

              {q.trim() &&
                filteredPages.length === 0 &&
                filteredAdmin.length === 0 &&
                players.length === 0 &&
                !isFetching && (
                  <div className="px-3 py-6 text-center text-sm text-neutral-500">
                    No matches for{" "}
                    <span className="font-semibold">{q.trim()}</span>.
                  </div>
                )}
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-2 text-[10px] tracking-[0.18em] text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-900">
              <span>The Hat League · Search</span>
              <span>
                <kbd className="rounded border border-neutral-300 px-1 py-0.5 dark:border-neutral-700">
                  ⌘
                </kbd>{" "}
                <kbd className="rounded border border-neutral-300 px-1 py-0.5 dark:border-neutral-700">
                  K
                </kbd>{" "}
                anywhere
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <div className="px-3 py-1.5 text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition hover:bg-thl-orange/10 hover:text-thl-orange dark:text-neutral-300"
    >
      {children}
    </button>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
