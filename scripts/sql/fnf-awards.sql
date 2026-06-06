-- Friday Nite Fights → rewards/patches integration.
-- Adds the FNF patch catalog and a self-gated SECURITY DEFINER function that
-- awards points + badges from authoritative tournament data. Idempotent: every
-- write uses ON CONFLICT DO NOTHING against the existing dedup indexes, so it is
-- safe to call on every match report and to re-run as a backfill.
--
-- Why a SECURITY DEFINER RPC (not lib/awards/engine.ts): point_events and
-- player_badges are write-gated to is_league_ops(), but FNF matches are reported
-- by regular players. This function self-gates to "participant in the tournament
-- OR league ops", then writes with definer privileges. Mirrors the project's
-- fnf_* RPC convention.

-- 1) Patch catalog -----------------------------------------------------------
insert into public.badges (slug, name, description, category, tier, icon, is_active) values
  ('fnf-fighter',  'Night Fighter',   'Stepped into the ring for a Friday Nite Fights tournament.', 'fnf', 'bronze',    'flame',  true),
  ('fnf-playoffs', 'Into the Lights', 'Reached the playoffs at Friday Nite Fights.',                'fnf', 'silver',    'swords', true),
  ('fnf-finalist', 'Title Shot',      'Fought all the way to the Friday Nite Fights final.',        'fnf', 'gold',      'medal',  true),
  ('fnf-champion', 'FNF Champion',    'Won a Friday Nite Fights tournament.',                        'fnf', 'legendary', 'trophy', true),
  ('fnf-sweeper',  'Undefeated',      'Won Friday Nite Fights without dropping a single series.',    'fnf', 'gold',      'shield', true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  tier = excluded.tier,
  icon = excluded.icon,
  is_active = excluded.is_active;

-- 2) Award function ----------------------------------------------------------
create or replace function public.fnf_award_tournament(
  p_tournament uuid,
  p_season uuid default null
)
returns void
language plpgsql
security definer
set search_path to public
as $$
declare
  v_final_round int;
  v_champ_team uuid;
  v_runner_team uuid;
  v_undefeated boolean;
begin
  -- Gate: only a tournament participant or league ops may trigger awards.
  if not (
    is_league_ops()
    or exists (
      select 1 from fnf_registrations r
      where r.tournament_id = p_tournament and r.profile_id = auth.uid()
    )
  ) then
    raise exception 'not authorized to award this tournament';
  end if;

  -- Resolve champion + runner-up from the highest playoff round, if decided.
  select max(round) into v_final_round
    from fnf_matches
   where tournament_id = p_tournament and stage = 'playoffs';

  if v_final_round is not null then
    select winner_team_id,
           case when team_a_id = winner_team_id then team_b_id else team_a_id end
      into v_champ_team, v_runner_team
      from fnf_matches
     where tournament_id = p_tournament
       and stage = 'playoffs'
       and round = v_final_round
       and winner_team_id is not null
     order by slot
     limit 1;
  end if;

  -- (a) Participation points + "Night Fighter" for every rostered player.
  insert into point_events (profile_id, season_id, source, points, ref_type, ref_id, note)
  select tm.profile_id, p_season, 'fnf_played', 15, 'fnf_tournament', p_tournament::text,
         'Friday Nite Fights entry'
    from fnf_team_members tm
   where tm.tournament_id = p_tournament
  on conflict (profile_id, source, ref_type, ref_id) do nothing;

  perform public._fnf_grant_badge(
    'fnf-fighter', p_season,
    array(select distinct tm.profile_id from fnf_team_members tm
          where tm.tournament_id = p_tournament),
    p_tournament
  );

  -- (b) Per-series win points (swiss + playoffs).
  insert into point_events (profile_id, season_id, source, points, ref_type, ref_id)
  select tm.profile_id, p_season,
         case when m.stage = 'playoffs' then 'fnf_playoff_win' else 'fnf_win' end,
         case when m.stage = 'playoffs' then 35 else 20 end,
         'fnf_match', m.id::text
    from fnf_matches m
    join fnf_team_members tm on tm.team_id = m.winner_team_id
   where m.tournament_id = p_tournament
     and m.status = 'reported'
     and m.winner_team_id is not null
  on conflict (profile_id, source, ref_type, ref_id) do nothing;

  -- (c) Playoffs badge for anyone who appeared in a playoff match.
  perform public._fnf_grant_badge(
    'fnf-playoffs', p_season,
    array(
      select distinct tm.profile_id
        from fnf_matches m
        join fnf_team_members tm
          on tm.team_id = m.team_a_id or tm.team_id = m.team_b_id
       where m.tournament_id = p_tournament and m.stage = 'playoffs'
    ),
    p_tournament
  );

  -- (d) Champion: badge + 200 pts.
  if v_champ_team is not null then
    insert into point_events (profile_id, season_id, source, points, ref_type, ref_id)
    select tm.profile_id, p_season, 'fnf_champion', 200, 'fnf_tournament', p_tournament::text
      from fnf_team_members tm
     where tm.team_id = v_champ_team
    on conflict (profile_id, source, ref_type, ref_id) do nothing;

    perform public._fnf_grant_badge(
      'fnf-champion', p_season,
      array(select tm.profile_id from fnf_team_members tm where tm.team_id = v_champ_team),
      p_tournament
    );

    -- (e) Undefeated sweep — champion never lost a reported series.
    v_undefeated := not exists (
      select 1 from fnf_matches m
       where m.tournament_id = p_tournament
         and m.status = 'reported'
         and m.winner_team_id is not null
         and (m.team_a_id = v_champ_team or m.team_b_id = v_champ_team)
         and m.winner_team_id <> v_champ_team
    );
    if v_undefeated then
      perform public._fnf_grant_badge(
        'fnf-sweeper', p_season,
        array(select tm.profile_id from fnf_team_members tm where tm.team_id = v_champ_team),
        p_tournament
      );
    end if;
  end if;

  -- (f) Finalist (runner-up): badge + 80 pts.
  if v_runner_team is not null then
    insert into point_events (profile_id, season_id, source, points, ref_type, ref_id)
    select tm.profile_id, p_season, 'fnf_finalist', 80, 'fnf_tournament', p_tournament::text
      from fnf_team_members tm
     where tm.team_id = v_runner_team
    on conflict (profile_id, source, ref_type, ref_id) do nothing;

    perform public._fnf_grant_badge(
      'fnf-finalist', p_season,
      array(select tm.profile_id from fnf_team_members tm where tm.team_id = v_runner_team),
      p_tournament
    );
  end if;
end;
$$;

-- Helper: grant a badge (and its +20 bonus points) to a set of profiles.
-- Mirrors lib/awards/engine.ts awardBadge so FNF badges behave like all others.
create or replace function public._fnf_grant_badge(
  p_slug text,
  p_season uuid,
  p_profiles uuid[],
  p_tournament uuid
)
returns void
language plpgsql
security definer
set search_path to public
as $$
declare
  v_badge uuid;
begin
  select id into v_badge from badges where slug = p_slug;
  if v_badge is null or p_profiles is null then return; end if;

  insert into player_badges (profile_id, badge_id, season_id, context)
  select pid, v_badge, p_season, jsonb_build_object('tournamentId', p_tournament)
    from unnest(p_profiles) as pid
  on conflict (profile_id, badge_id, season_id) do nothing;

  insert into point_events (profile_id, season_id, source, points, ref_type, ref_id)
  select pid, p_season, 'badge', 20, 'badge', p_slug || ':' || coalesce(p_season::text, 'all')
    from unnest(p_profiles) as pid
  on conflict (profile_id, source, ref_type, ref_id) do nothing;
end;
$$;

grant execute on function public.fnf_award_tournament(uuid, uuid) to anon, authenticated;
