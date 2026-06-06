-- SH*T Faced Saturday own-goal counter. Anyone signed in can log an own goal
-- and (optionally) tag a registered player; counts surface on the SFS page, the
-- tagged player's profile, and a broadcast overlay. Public read so the counter
-- and the OBS overlay can render; inserts are attributed to the reporter.

create table if not exists public.sfs_own_goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  player_name text,
  reported_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  constraint sfs_own_goals_who
    check (profile_id is not null or (player_name is not null and length(btrim(player_name)) > 0))
);

create index if not exists sfs_own_goals_profile_idx on public.sfs_own_goals (profile_id);
create index if not exists sfs_own_goals_created_idx on public.sfs_own_goals (created_at desc);

alter table public.sfs_own_goals enable row level security;

drop policy if exists sfs_own_goals_read on public.sfs_own_goals;
create policy sfs_own_goals_read on public.sfs_own_goals
  for select using (true);

drop policy if exists sfs_own_goals_insert on public.sfs_own_goals;
create policy sfs_own_goals_insert on public.sfs_own_goals
  for insert with check (reported_by = auth.uid());

drop policy if exists sfs_own_goals_delete on public.sfs_own_goals;
create policy sfs_own_goals_delete on public.sfs_own_goals
  for delete using (reported_by = auth.uid() or is_league_ops());

-- Realtime for the live counter + overlay (ignore if already published).
do $$
begin
  alter publication supabase_realtime add table public.sfs_own_goals;
exception
  when duplicate_object then null;
  when others then null;
end $$;
