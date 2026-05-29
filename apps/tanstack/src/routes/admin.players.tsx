import {
  createFileRoute,
  Link,
  notFound,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { SiteFooter } from "@/components/site-footer";
import { getViewer } from "@/server/auth";
import {
  getAdminPlayers,
  setPlayerAdmin,
  setPlayerInPool,
  type AdminPlayer,
} from "@/server/admin";
import { AdminTabs } from "./admin";

export const Route = createFileRoute("/admin/players")({
  beforeLoad: async () => {
    const viewer = await getViewer();
    if (!viewer) {
      throw redirect({
        to: "/signin",
        search: { redirect: "/admin/players" },
      });
    }
    if (!viewer.isAdmin) throw notFound();
    return { viewer };
  },
  loader: async ({ context }) => {
    const players = await getAdminPlayers();
    if (!players) throw notFound();
    return { players, viewerId: context.viewer.userId };
  },
  component: AdminPlayersPage,
  head: () => ({
    meta: [
      { title: "Admin · Players · The Hat League" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminPlayersPage() {
  const { players, viewerId } = Route.useLoaderData();
  const [filter, setFilter] = useState("");
  const lower = filter.trim().toLowerCase();
  const filtered = lower
    ? players.filter((p) => {
        const u = (p.discord_username ?? "").toLowerCase();
        const g = (p.discord_global_name ?? "").toLowerCase();
        return u.includes(lower) || g.includes(lower);
      })
    : players;

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <AdminTabs current="players" />
        <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            Players
          </div>
          <h1 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
            {players.length}{" "}
            <span className="font-marker font-normal text-thl-orange">
              profiles.
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">
            Flip pool membership and admin role. Captain status lives in the
            Captains tab.
          </p>

          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by handle…"
            className="mt-6 w-full max-w-md rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-thl-orange focus:ring-1 focus:ring-thl-orange dark:border-neutral-800 dark:bg-black dark:text-white"
          />

          <ul className="mt-6 grid gap-3">
            {filtered.map((p) => (
              <PlayerRow key={p.id} row={p} isSelf={p.id === viewerId} />
            ))}
            {filtered.length === 0 && (
              <li className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-8 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
                No matches.
              </li>
            )}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function PlayerRow({
  row,
  isSelf,
}: {
  row: AdminPlayer;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const name = row.discord_global_name ?? row.discord_username ?? "Unnamed";

  function togglePool() {
    start(async () => {
      await setPlayerInPool({
        data: { profileId: row.id, next: !row.in_player_pool },
      });
      router.invalidate();
    });
  }

  function toggleAdmin() {
    start(async () => {
      await setPlayerAdmin({
        data: { profileId: row.id, next: !row.is_admin },
      });
      router.invalidate();
    });
  }

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      {row.discord_avatar_url ? (
        <img
          src={row.discord_avatar_url}
          alt=""
          className="h-10 w-10 rounded-full border border-neutral-200 dark:border-neutral-800"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-thl-orange text-xs font-bold text-black">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {row.discord_username ? (
            <Link
              to="/players/$username"
              params={{ username: row.discord_username }}
              className="truncate font-bold hover:text-thl-orange"
            >
              {name}
            </Link>
          ) : (
            <span className="truncate font-bold">{name}</span>
          )}
          {row.is_captain && (
            <span className="rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase">
              Captain
            </span>
          )}
          {row.is_admin && (
            <span className="rounded-md bg-thl-orange/20 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase">
              Admin
            </span>
          )}
        </div>
        <div className="text-xs text-neutral-500">
          @{row.discord_username ?? "—"}
          {row.peak_rank ? ` · Peak ${row.peak_rank}` : ""}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePool}
          disabled={pending}
          className="rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 transition hover:border-thl-orange hover:text-thl-orange disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-400"
        >
          {row.in_player_pool ? "Remove from pool" : "Add to pool"}
        </button>
        <button
          type="button"
          onClick={toggleAdmin}
          disabled={pending || (isSelf && row.is_admin)}
          title={
            isSelf && row.is_admin
              ? "Can't demote yourself"
              : row.is_admin
                ? "Revoke admin"
                : "Promote to admin"
          }
          className="rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 transition hover:border-thl-orange hover:text-thl-orange disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-400"
        >
          {row.is_admin ? "Revoke admin" : "Make admin"}
        </button>
      </div>
    </li>
  );
}
