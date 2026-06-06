// Generated from the self-hosted Supabase DB (information_schema introspection).
// Re-run scripts/gen-types.ts when the schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      announcements: {
        Row: {
          id: number;
          slug: string;
          title: string;
          body: string;
          published_at: string | null;
          posted_by: string | null;
          pinned: boolean;
          created_at: string;
          updated_at: string;
          kind: string;
        };
        Insert: {
          id?: number;
          slug: string;
          title: string;
          body: string;
          published_at?: string | null;
          posted_by?: string | null;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
          kind?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          title?: string;
          body?: string;
          published_at?: string | null;
          posted_by?: string | null;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
          kind?: string;
        };
        Relationships: [];
      };
      assets: {
        Row: {
          id: string;
          profile_id: string;
          season_id: string | null;
          kind: string;
          source: string;
          url: string;
          storage_path: string | null;
          title: string | null;
          thumbnail_url: string | null;
          mime_type: string | null;
          size_bytes: number | null;
          target_type: string;
          target_id: string;
          approved: boolean;
          votes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          season_id?: string | null;
          kind?: string;
          source?: string;
          url: string;
          storage_path?: string | null;
          title?: string | null;
          thumbnail_url?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          target_type: string;
          target_id: string;
          approved?: boolean;
          votes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          season_id?: string | null;
          kind?: string;
          source?: string;
          url?: string;
          storage_path?: string | null;
          title?: string | null;
          thumbnail_url?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          target_type?: string;
          target_id?: string;
          approved?: boolean;
          votes?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          category: string;
          tier: string;
          icon: string | null;
          criteria_type: string | null;
          criteria: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          category?: string;
          tier?: string;
          icon?: string | null;
          criteria_type?: string | null;
          criteria?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          category?: string;
          tier?: string;
          icon?: string | null;
          criteria_type?: string | null;
          criteria?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      clips: {
        Row: {
          id: string;
          profile_id: string;
          season_id: string | null;
          match_id: string | null;
          title: string | null;
          url: string;
          thumbnail_url: string | null;
          approved: boolean;
          votes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          season_id?: string | null;
          match_id?: string | null;
          title?: string | null;
          url: string;
          thumbnail_url?: string | null;
          approved?: boolean;
          votes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          season_id?: string | null;
          match_id?: string | null;
          title?: string | null;
          url?: string;
          thumbnail_url?: string | null;
          approved?: boolean;
          votes?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      combine_profiles: {
        Row: {
          id: string;
          season_id: string;
          profile_id: string;
          showcase_clip_url: string | null;
          preferred_role: string | null;
          secondary_role: string | null;
          availability: string | null;
          notes: string | null;
          submitted_at: string;
          updated_at: string;
          clip_urls: string[];
        };
        Insert: {
          id?: string;
          season_id: string;
          profile_id: string;
          showcase_clip_url?: string | null;
          preferred_role?: string | null;
          secondary_role?: string | null;
          availability?: string | null;
          notes?: string | null;
          submitted_at?: string;
          updated_at?: string;
          clip_urls?: string[];
        };
        Update: {
          id?: string;
          season_id?: string;
          profile_id?: string;
          showcase_clip_url?: string | null;
          preferred_role?: string | null;
          secondary_role?: string | null;
          availability?: string | null;
          notes?: string | null;
          submitted_at?: string;
          updated_at?: string;
          clip_urls?: string[];
        };
        Relationships: [];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          conversation_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          conversation_id?: string;
          profile_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      conversation_reads: {
        Row: {
          conversation_id: string;
          profile_id: string;
          last_read_at: string;
        };
        Insert: {
          conversation_id: string;
          profile_id: string;
          last_read_at?: string;
        };
        Update: {
          conversation_id?: string;
          profile_id?: string;
          last_read_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          kind: string;
          team_id: string | null;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          kind: string;
          team_id?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          kind?: string;
          team_id?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      draft_order: {
        Row: {
          id: string;
          season_id: string;
          position: number;
          team_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          position: number;
          team_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          position?: number;
          team_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      draft_picks: {
        Row: {
          id: string;
          season_id: string;
          overall_pick: number;
          round: number;
          pick_in_round: number;
          team_id: string;
          profile_id: string;
          picked_by: string | null;
          auto_picked: boolean;
          pick_duration_ms: number | null;
          picked_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          overall_pick: number;
          round: number;
          pick_in_round: number;
          team_id: string;
          profile_id: string;
          picked_by?: string | null;
          auto_picked?: boolean;
          pick_duration_ms?: number | null;
          picked_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          overall_pick?: number;
          round?: number;
          pick_in_round?: number;
          team_id?: string;
          profile_id?: string;
          picked_by?: string | null;
          auto_picked?: boolean;
          pick_duration_ms?: number | null;
          picked_at?: string;
        };
        Relationships: [];
      };
      draft_queues: {
        Row: {
          id: string;
          season_id: string;
          team_id: string;
          profile_id: string;
          rank: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          team_id: string;
          profile_id: string;
          rank: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          team_id?: string;
          profile_id?: string;
          rank?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      draft_state: {
        Row: {
          id: string;
          season_id: string;
          status: string;
          current_overall_pick: number;
          on_clock_team_id: string | null;
          current_round: number;
          pick_ends_at: string | null;
          is_paused: boolean;
          paused_remaining_ms: number | null;
          last_pick_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          status?: string;
          current_overall_pick?: number;
          on_clock_team_id?: string | null;
          current_round?: number;
          pick_ends_at?: string | null;
          is_paused?: boolean;
          paused_remaining_ms?: number | null;
          last_pick_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          status?: string;
          current_overall_pick?: number;
          on_clock_team_id?: string | null;
          current_round?: number;
          pick_ends_at?: string | null;
          is_paused?: boolean;
          paused_remaining_ms?: number | null;
          last_pick_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      fnf_matches: {
        Row: {
          id: string;
          tournament_id: string;
          stage: string;
          round: number;
          slot: number;
          team_a_id: string | null;
          team_b_id: string | null;
          score_a: number | null;
          score_b: number | null;
          winner_team_id: string | null;
          status: string;
          best_of: number;
          reported_by: string | null;
          reported_at: string | null;
          next_match_id: string | null;
          next_slot_is_a: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          stage: string;
          round: number;
          slot?: number;
          team_a_id?: string | null;
          team_b_id?: string | null;
          score_a?: number | null;
          score_b?: number | null;
          winner_team_id?: string | null;
          status?: string;
          best_of?: number;
          reported_by?: string | null;
          reported_at?: string | null;
          next_match_id?: string | null;
          next_slot_is_a?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          stage?: string;
          round?: number;
          slot?: number;
          team_a_id?: string | null;
          team_b_id?: string | null;
          score_a?: number | null;
          score_b?: number | null;
          winner_team_id?: string | null;
          status?: string;
          best_of?: number;
          reported_by?: string | null;
          reported_at?: string | null;
          next_match_id?: string | null;
          next_slot_is_a?: boolean | null;
          created_at?: string;
        };
        Relationships: [];
      };
      fnf_registrations: {
        Row: {
          tournament_id: string;
          profile_id: string;
          rank_value: string | null;
          rank_weight: number;
          checked_in: boolean;
          created_at: string;
        };
        Insert: {
          tournament_id: string;
          profile_id: string;
          rank_value?: string | null;
          rank_weight?: number;
          checked_in?: boolean;
          created_at?: string;
        };
        Update: {
          tournament_id?: string;
          profile_id?: string;
          rank_value?: string | null;
          rank_weight?: number;
          checked_in?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      fnf_team_members: {
        Row: {
          team_id: string;
          profile_id: string;
          tournament_id: string;
        };
        Insert: {
          team_id: string;
          profile_id: string;
          tournament_id: string;
        };
        Update: {
          team_id?: string;
          profile_id?: string;
          tournament_id?: string;
        };
        Relationships: [];
      };
      fnf_teams: {
        Row: {
          id: string;
          tournament_id: string;
          seed: number;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          seed: number;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          seed?: number;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      fnf_tournaments: {
        Row: {
          id: string;
          name: string;
          status: string;
          swiss_rounds: number;
          current_round: number;
          team_size: number;
          best_of: number;
          swiss_best_of: number;
          playoff_best_of: number;
          playoff_cut: number;
          starts_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          status?: string;
          swiss_rounds?: number;
          current_round?: number;
          team_size?: number;
          best_of?: number;
          swiss_best_of?: number;
          playoff_best_of?: number;
          playoff_cut?: number;
          starts_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: string;
          swiss_rounds?: number;
          current_round?: number;
          team_size?: number;
          best_of?: number;
          swiss_best_of?: number;
          playoff_best_of?: number;
          playoff_cut?: number;
          starts_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: string;
          created_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: string;
          created_at?: string;
          responded_at?: string | null;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: string;
          created_at?: string;
          responded_at?: string | null;
        };
        Relationships: [];
      };
      historical_player_stats: {
        Row: {
          id: number;
          season: number;
          conference: string;
          player_name: string;
          goals: number;
          assists: number;
          saves: number;
          demos: number;
          deleted: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          season: number;
          conference: string;
          player_name: string;
          goals?: number;
          assists?: number;
          saves?: number;
          demos?: number;
          deleted?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          season?: number;
          conference?: string;
          player_name?: string;
          goals?: number;
          assists?: number;
          saves?: number;
          demos?: number;
          deleted?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      match_games: {
        Row: {
          id: string;
          match_id: string;
          game_number: number;
          home_goals: number;
          away_goals: number;
          ballchasing_id: string | null;
          replay_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          game_number: number;
          home_goals?: number;
          away_goals?: number;
          ballchasing_id?: string | null;
          replay_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          game_number?: number;
          home_goals?: number;
          away_goals?: number;
          ballchasing_id?: string | null;
          replay_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      match_predictions: {
        Row: {
          id: string;
          match_id: string;
          profile_id: string;
          predicted_winner_team_id: string;
          predicted_home_score: number | null;
          predicted_away_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          profile_id: string;
          predicted_winner_team_id: string;
          predicted_home_score?: number | null;
          predicted_away_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          profile_id?: string;
          predicted_winner_team_id?: string;
          predicted_home_score?: number | null;
          predicted_away_score?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          season_id: string;
          week: number | null;
          conference: string | null;
          round_label: string | null;
          home_team_id: string;
          away_team_id: string;
          scheduled_at: string | null;
          status: string;
          home_score: number;
          away_score: number;
          best_of: number;
          winner_team_id: string | null;
          bracket: string | null;
          challonge_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          week?: number | null;
          conference?: string | null;
          round_label?: string | null;
          home_team_id: string;
          away_team_id: string;
          scheduled_at?: string | null;
          status?: string;
          home_score?: number;
          away_score?: number;
          best_of?: number;
          winner_team_id?: string | null;
          bracket?: string | null;
          challonge_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          week?: number | null;
          conference?: string | null;
          round_label?: string | null;
          home_team_id?: string;
          away_team_id?: string;
          scheduled_at?: string | null;
          status?: string;
          home_score?: number;
          away_score?: number;
          best_of?: number;
          winner_team_id?: string | null;
          bracket?: string | null;
          challonge_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      mvp_votes: {
        Row: {
          id: string;
          match_id: string;
          voter_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          voter_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          voter_id?: string;
          profile_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      overlay_settings: {
        Row: {
          id: string;
          season_id: string;
          active_scene: string;
          theme: string;
          show_timer: boolean;
          show_recent_picks: boolean;
          lower_third: string | null;
          ticker_text: string | null;
          accent: string | null;
          extras: Json;
          overlay_token: string;
          created_at: string;
          updated_at: string;
          reveal_seconds: number;
          reveal_sound: boolean;
          show_on_deck: boolean;
        };
        Insert: {
          id?: string;
          season_id: string;
          active_scene?: string;
          theme?: string;
          show_timer?: boolean;
          show_recent_picks?: boolean;
          lower_third?: string | null;
          ticker_text?: string | null;
          accent?: string | null;
          extras?: Json;
          overlay_token?: string;
          created_at?: string;
          updated_at?: string;
          reveal_seconds?: number;
          reveal_sound?: boolean;
          show_on_deck?: boolean;
        };
        Update: {
          id?: string;
          season_id?: string;
          active_scene?: string;
          theme?: string;
          show_timer?: boolean;
          show_recent_picks?: boolean;
          lower_third?: string | null;
          ticker_text?: string | null;
          accent?: string | null;
          extras?: Json;
          overlay_token?: string;
          created_at?: string;
          updated_at?: string;
          reveal_seconds?: number;
          reveal_sound?: boolean;
          show_on_deck?: boolean;
        };
        Relationships: [];
      };
      player_badges: {
        Row: {
          id: string;
          profile_id: string;
          badge_id: string;
          season_id: string | null;
          context: Json;
          awarded_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          badge_id: string;
          season_id?: string | null;
          context?: Json;
          awarded_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          badge_id?: string;
          season_id?: string | null;
          context?: Json;
          awarded_at?: string;
        };
        Relationships: [];
      };
      player_stats: {
        Row: {
          id: string;
          season_id: string;
          profile_id: string;
          match_id: string | null;
          goals: number;
          assists: number;
          saves: number;
          demos: number;
          score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          profile_id: string;
          match_id?: string | null;
          goals?: number;
          assists?: number;
          saves?: number;
          demos?: number;
          score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          profile_id?: string;
          match_id?: string | null;
          goals?: number;
          assists?: number;
          saves?: number;
          demos?: number;
          score?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      point_events: {
        Row: {
          id: string;
          profile_id: string;
          season_id: string | null;
          source: string;
          points: number;
          ref_type: string | null;
          ref_id: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          season_id?: string | null;
          source: string;
          points: number;
          ref_type?: string | null;
          ref_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          season_id?: string | null;
          source?: string;
          points?: number;
          ref_type?: string | null;
          ref_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      power_rankings: {
        Row: {
          id: string;
          season_id: string;
          week: number;
          team_id: string;
          rank: number;
          previous_rank: number | null;
          blurb: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          week: number;
          team_id: string;
          rank: number;
          previous_rank?: number | null;
          blurb?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          week?: number;
          team_id?: string;
          rank?: number;
          previous_rank?: number | null;
          blurb?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profile_rank_history: {
        Row: {
          id: string;
          profile_id: string;
          rank_2v2: string | null;
          rank_3v3: string | null;
          peak_rank: string | null;
          captured_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          rank_2v2?: string | null;
          rank_3v3?: string | null;
          peak_rank?: string | null;
          captured_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          rank_2v2?: string | null;
          rank_3v3?: string | null;
          peak_rank?: string | null;
          captured_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          discord_id: string | null;
          discord_username: string | null;
          discord_global_name: string | null;
          discord_avatar_url: string | null;
          rl_tracker_url: string | null;
          rank_2v2: string | null;
          rank_3v3: string | null;
          peak_rank: string | null;
          peak_rank_playlist: string | null;
          ranks_updated_at: string | null;
          in_player_pool: boolean;
          is_captain: boolean;
          created_at: string;
          updated_at: string;
          is_captain_applicant: boolean;
          captain_pitch: string | null;
          is_admin: boolean;
          profile_avatar_url: string | null;
          profile_banner_url: string | null;
          bio: string | null;
          social_links: Json;
          is_developer: boolean;
          is_mock: boolean;
          admin_pitch: string | null;
          is_admin_applicant: boolean;
        };
        Insert: {
          id: string;
          discord_id?: string | null;
          discord_username?: string | null;
          discord_global_name?: string | null;
          discord_avatar_url?: string | null;
          rl_tracker_url?: string | null;
          rank_2v2?: string | null;
          rank_3v3?: string | null;
          peak_rank?: string | null;
          peak_rank_playlist?: string | null;
          ranks_updated_at?: string | null;
          in_player_pool?: boolean;
          is_captain?: boolean;
          created_at?: string;
          updated_at?: string;
          is_captain_applicant?: boolean;
          captain_pitch?: string | null;
          is_admin?: boolean;
          profile_avatar_url?: string | null;
          profile_banner_url?: string | null;
          bio?: string | null;
          social_links?: Json;
          is_developer?: boolean;
          is_mock?: boolean;
          admin_pitch?: string | null;
          is_admin_applicant?: boolean;
        };
        Update: {
          id?: string;
          discord_id?: string | null;
          discord_username?: string | null;
          discord_global_name?: string | null;
          discord_avatar_url?: string | null;
          rl_tracker_url?: string | null;
          rank_2v2?: string | null;
          rank_3v3?: string | null;
          peak_rank?: string | null;
          peak_rank_playlist?: string | null;
          ranks_updated_at?: string | null;
          in_player_pool?: boolean;
          is_captain?: boolean;
          created_at?: string;
          updated_at?: string;
          is_captain_applicant?: boolean;
          captain_pitch?: string | null;
          is_admin?: boolean;
          profile_avatar_url?: string | null;
          profile_banner_url?: string | null;
          bio?: string | null;
          social_links?: Json;
          is_developer?: boolean;
          is_mock?: boolean;
          admin_pitch?: string | null;
          is_admin_applicant?: boolean;
        };
        Relationships: [];
      };
      seasons: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: string;
          is_active: boolean;
          conferences: string[];
          draft_settings: Json;
          combine_at: string | null;
          draft_at: string | null;
          regular_starts_at: string | null;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: string;
          is_active?: boolean;
          conferences?: string[];
          draft_settings?: Json;
          combine_at?: string | null;
          draft_at?: string | null;
          regular_starts_at?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          status?: string;
          is_active?: boolean;
          conferences?: string[];
          draft_settings?: Json;
          combine_at?: string | null;
          draft_at?: string | null;
          regular_starts_at?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          profile_id: string;
          season_id: string;
          is_captain: boolean;
          overall_pick: number | null;
          round: number | null;
          drafted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          profile_id: string;
          season_id: string;
          is_captain?: boolean;
          overall_pick?: number | null;
          round?: number | null;
          drafted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          profile_id?: string;
          season_id?: string;
          is_captain?: boolean;
          overall_pick?: number | null;
          round?: number | null;
          drafted_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          season_id: string;
          conference: string | null;
          name: string;
          slug: string;
          captain_id: string | null;
          seed: number | null;
          color: string | null;
          logo_url: string | null;
          draft_position: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          conference?: string | null;
          name: string;
          slug: string;
          captain_id?: string | null;
          seed?: number | null;
          color?: string | null;
          logo_url?: string | null;
          draft_position?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          conference?: string | null;
          name?: string;
          slug?: string;
          captain_id?: string | null;
          seed?: number | null;
          color?: string | null;
          logo_url?: string | null;
          draft_position?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      fnf_is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      fnf_upsert_tournament: {
        Args: {
          p_id: string | null;
          p_name: string | null;
          p_swiss_rounds: number | null;
          p_swiss_best_of: number | null;
          p_playoff_best_of: number | null;
          p_playoff_cut: number | null;
          p_starts_at: string | null;
        };
        Returns: string;
      };
      fnf_set_status: {
        Args: { p_tournament: string; p_status: string };
        Returns: undefined;
      };
      fnf_generate_teams: {
        Args: { p_tournament: string; p_teams: Json };
        Returns: undefined;
      };
      fnf_set_rosters: {
        Args: { p_tournament: string; p_rosters: Json };
        Returns: undefined;
      };
      fnf_create_round: {
        Args: {
          p_tournament: string;
          p_stage: string;
          p_round: number;
          p_matches: Json;
        };
        Returns: undefined;
      };
      fnf_create_playoffs: {
        Args: { p_tournament: string; p_matches: Json };
        Returns: undefined;
      };
      fnf_report_match: {
        Args: { p_match: string; p_score_a: number; p_score_b: number };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type HistoricalPlayerStatsRow = Tables<"historical_player_stats">;
export type Announcement = Tables<"announcements">;
