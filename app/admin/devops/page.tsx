import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  approveDevops,
  dismissDevopsApplication,
  revokeDevops,
} from "@/app/actions/admin";

export default async function AdminDevopsPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: pending }, { data: confirmed }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, discord_username, discord_global_name, discord_avatar_url, devops_pitch, updated_at",
      )
      .eq("is_devops_applicant", true)
      .eq("is_devops", false)
      .order("updated_at", { ascending: false }),
    supabase
      .from("profiles")
      .select(
        "id, discord_username, discord_global_name, discord_avatar_url",
      )
      .eq("is_devops", true)
      .order("created_at", { ascending: true }),
  ]);

  const pendingRows = pending ?? [];
  const confirmedRows = confirmed ?? [];

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
      <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
        Devops
      </div>
      <h1 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
        {pendingRows.length} pending,{" "}
        <span className="font-marker font-normal text-thl-orange">
          {confirmedRows.length} on the crew.
        </span>
      </h1>

      <h2 className="mt-12 text-xl font-bold tracking-tight">
        Pending applications
      </h2>
      {pendingRows.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-8 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
          No pending applications.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {pendingRows.map((p) => {
            const name =
              p.discord_global_name ?? p.discord_username ?? "Unnamed";
            const profileHref = p.discord_username
              ? `/players/${encodeURIComponent(p.discord_username)}`
              : null;
            return (
              <li
                key={p.id}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex items-center gap-3">
                  {p.discord_avatar_url ? (
                    <Image
                      src={p.discord_avatar_url}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 rounded-full border border-neutral-200 dark:border-neutral-800"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thl-orange font-bold text-black">
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-base font-bold">
                      {profileHref ? (
                        <Link
                          href={profileHref}
                          className="hover:text-thl-orange"
                        >
                          {name}
                        </Link>
                      ) : (
                        name
                      )}
                    </div>
                    <div className="truncate text-xs text-neutral-500">
                      @{p.discord_username ?? "—"}
                    </div>
                  </div>
                </div>

                {p.devops_pitch && (
                  <blockquote className="mt-4 max-h-40 overflow-auto border-l-2 border-thl-orange/40 pl-3 text-sm leading-relaxed text-neutral-700 italic dark:text-neutral-300">
                    &ldquo;{p.devops_pitch}&rdquo;
                  </blockquote>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <form action={approveDevops}>
                    <input type="hidden" name="profile_id" value={p.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-thl-orange px-4 py-2 text-sm font-bold text-black hover:bg-thl-orange-deep"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={dismissDevopsApplication}>
                    <input type="hidden" name="profile_id" value={p.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-rose-400 hover:text-rose-500 dark:border-neutral-700 dark:text-neutral-300"
                    >
                      Dismiss
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-16 text-xl font-bold tracking-tight">
        Confirmed devops crew
      </h2>
      {confirmedRows.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">
          No devops crew confirmed yet.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {confirmedRows.map((c) => {
            const name =
              c.discord_global_name ?? c.discord_username ?? "Devops";
            return (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {c.discord_avatar_url ? (
                    <Image
                      src={c.discord_avatar_url}
                      alt=""
                      width={36}
                      height={36}
                      unoptimized
                      className="h-9 w-9 rounded-full border border-thl-orange/30"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-thl-orange text-xs font-bold text-black">
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{name}</div>
                    <div className="mt-0.5 truncate text-[11px] text-neutral-500">
                      @{c.discord_username ?? "—"}
                    </div>
                  </div>
                </div>
                <form action={revokeDevops}>
                  <input type="hidden" name="profile_id" value={c.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 hover:border-rose-400 hover:text-rose-500 dark:border-neutral-700 dark:text-neutral-300"
                  >
                    Revoke
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
