"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cleanDiscordUsername } from "@/lib/discord/name";
import { sendFriendRequest } from "@/app/actions/friends";

interface Candidate {
  id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  profile_avatar_url: string | null;
  is_captain: boolean | null;
}

/** Search-by-username add-friend form with live typeahead suggestions. */
export function AddFriendForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Every signed-up, non-mock profile (minus yourself) — fetched once the
  // field is focused, then filtered client-side as the user types.
  const { data: people = [] } = useQuery<Candidate[]>({
    queryKey: ["friends", "candidates"],
    enabled: open,
    staleTime: 60_000,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, is_captain",
        )
        .eq("is_mock", false)
        .order("discord_username", { ascending: true });
      return ((data ?? []) as Candidate[]).filter((p) => p.id !== user?.id);
    },
  });

  const q = username.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return [];
    return people
      .map((p) => {
        const handle = cleanDiscordUsername(p.discord_username);
        if (!handle) return null;
        const name = p.discord_global_name ?? handle;
        return { ...p, handle, name };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .filter(
        (p) =>
          p.handle.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [people, q]);

  const submit = (handle?: string) =>
    start(async () => {
      const target = (handle ?? username).trim();
      if (!target) return;
      const res = await sendFriendRequest(target);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Friend request sent");
      setUsername("");
      setOpen(false);
      router.refresh();
    });

  const showList = open && q.length > 0 && matches.length > 0;

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <h2 className="text-lg font-bold tracking-tight">Add a friend</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Start typing a name or username — we&apos;ll find them.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Username" className="flex-1">
          <div className="relative">
            <Input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                blurTimer.current = setTimeout(() => setOpen(false), 120);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                else if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Search by name or username"
              autoComplete="off"
            />
            {showList && (
              <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
                {matches.map((m) => {
                  const avatar = m.profile_avatar_url ?? m.discord_avatar_url;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        // Keep the input focused so the click lands before blur
                        // collapses the list.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => submit(m.discord_username ?? m.handle)}
                        disabled={pending}
                        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-neutral-100 disabled:opacity-60 dark:hover:bg-neutral-900"
                      >
                        {avatar ? (
                          <Image
                            src={avatar}
                            alt=""
                            width={28}
                            height={28}
                            unoptimized
                            className="h-7 w-7 rounded-full"
                          />
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-thl-orange text-[10px] font-extrabold text-black">
                            {m.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {m.name}
                          </span>
                          <span className="block truncate text-xs text-neutral-500">
                            @{m.handle}
                          </span>
                        </span>
                        {m.is_captain && (
                          <span className="rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase">
                            Captain
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Field>
        <Button
          onClick={() => submit()}
          disabled={pending || !username.trim()}
          className="sm:w-auto"
        >
          <UserPlus className="h-4 w-4" aria-hidden />
          Send request
        </Button>
      </div>
    </div>
  );
}
