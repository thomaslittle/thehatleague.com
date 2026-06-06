// Generated from the self-hosted Supabase DB (scripts/gen-types.ts).
// Tables, views, functions, and enums. Re-run when the schema changes.

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
        Relationships: [
          {
            foreignKeyName: "announcements_posted_by_fkey";
            columns: ["posted_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "assets_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assets_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "clips_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clips_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clips_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "combine_profiles_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "combine_profiles_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "conversation_reads_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_reads_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "conversations_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "draft_order_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_order_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "draft_picks_picked_by_fkey";
            columns: ["picked_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_picks_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_picks_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_picks_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "draft_queues_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_queues_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_queues_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "draft_state_last_pick_id_fkey";
            columns: ["last_pick_id"];
            isOneToOne: false;
            referencedRelation: "draft_picks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_state_on_clock_team_id_fkey";
            columns: ["on_clock_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_state_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
        ];
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
          games: Json;
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
          games?: Json;
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
          games?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "fnf_matches_next_match_id_fkey";
            columns: ["next_match_id"];
            isOneToOne: false;
            referencedRelation: "fnf_matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fnf_matches_reported_by_fkey";
            columns: ["reported_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fnf_matches_team_a_id_fkey";
            columns: ["team_a_id"];
            isOneToOne: false;
            referencedRelation: "fnf_teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fnf_matches_team_b_id_fkey";
            columns: ["team_b_id"];
            isOneToOne: false;
            referencedRelation: "fnf_teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fnf_matches_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "fnf_tournaments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fnf_matches_winner_team_id_fkey";
            columns: ["winner_team_id"];
            isOneToOne: false;
            referencedRelation: "fnf_teams";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "fnf_registrations_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fnf_registrations_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "fnf_tournaments";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "fnf_team_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fnf_team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "fnf_teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fnf_team_members_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "fnf_tournaments";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "fnf_teams_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "fnf_tournaments";
            referencedColumns: ["id"];
          },
        ];
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
          playoff_cut: number;
          starts_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          swiss_best_of: number;
          playoff_best_of: number;
          final_best_of: number;
          swiss_games: number;
        };
        Insert: {
          id?: string;
          name?: string;
          status?: string;
          swiss_rounds?: number;
          current_round?: number;
          team_size?: number;
          best_of?: number;
          playoff_cut?: number;
          starts_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          swiss_best_of?: number;
          playoff_best_of?: number;
          final_best_of?: number;
          swiss_games?: number;
        };
        Update: {
          id?: string;
          name?: string;
          status?: string;
          swiss_rounds?: number;
          current_round?: number;
          team_size?: number;
          best_of?: number;
          playoff_cut?: number;
          starts_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          swiss_best_of?: number;
          playoff_best_of?: number;
          final_best_of?: number;
          swiss_games?: number;
        };
        Relationships: [
          {
            foreignKeyName: "fnf_tournaments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey";
            columns: ["addressee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "match_games_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "match_predictions_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_predictions_predicted_winner_team_id_fkey";
            columns: ["predicted_winner_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_predictions_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey";
            columns: ["away_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_home_team_id_fkey";
            columns: ["home_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_winner_team_id_fkey";
            columns: ["winner_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "mvp_votes_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mvp_votes_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mvp_votes_voter_id_fkey";
            columns: ["voter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "overlay_settings_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "player_badges_badge_id_fkey";
            columns: ["badge_id"];
            isOneToOne: false;
            referencedRelation: "badges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_badges_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_badges_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "player_stats_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_stats_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_stats_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "point_events_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "point_events_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "power_rankings_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "power_rankings_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "profile_rank_history_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
      sfs_own_goals: {
        Row: {
          id: string;
          profile_id: string | null;
          player_name: string | null;
          reported_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          player_name?: string | null;
          reported_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          player_name?: string | null;
          reported_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sfs_own_goals_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sfs_own_goals_reported_by_fkey";
            columns: ["reported_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "teams_captain_id_fkey";
            columns: ["captain_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teams_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      player_points_view: {
        Row: {
          season_id: string | null;
          profile_id: string | null;
          points: number | null;
        };
        Relationships: [];
      };
      player_season_stats: {
        Row: {
          season_id: string | null;
          profile_id: string | null;
          games_played: number | null;
          goals: number | null;
          assists: number | null;
          saves: number | null;
          demos: number | null;
          score: number | null;
        };
        Relationships: [];
      };
      standings_view: {
        Row: {
          team_id: string | null;
          season_id: string | null;
          name: string | null;
          slug: string | null;
          conference: string | null;
          color: string | null;
          captain_id: string | null;
          gp: number | null;
          w: number | null;
          l: number | null;
          gf: number | null;
          ga: number | null;
          diff: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      _fnf_grant_badge: {
        Args: { p_slug?: string | null; p_season?: string | null; p_profiles?: string[] | null; p_tournament?: string | null };
        Returns: undefined;
      };
      are_friends: {
        Args: { a?: string | null; b?: string | null };
        Returns: boolean;
      };
      bump_conversation: {
        Args: Record<string, never>;
        Returns: string;
      };
      can_access_conversation: {
        Args: { conv?: string | null };
        Returns: boolean;
      };
      can_dm: {
        Args: { a?: string | null; b?: string | null };
        Returns: boolean;
      };
      draft_picks_per_team: {
        Args: { p_season?: string | null };
        Returns: number;
      };
      draft_team_at: {
        Args: { p_season?: string | null; p_overall?: number | null };
        Returns: string;
      };
      fnf_award_tournament: {
        Args: { p_tournament?: string | null; p_season?: string | null };
        Returns: undefined;
      };
      fnf_create_playoffs: {
        Args: { p_tournament?: string | null; p_matches?: Json | null };
        Returns: undefined;
      };
      fnf_create_round: {
        Args: { p_tournament?: string | null; p_stage?: string | null; p_round?: number | null; p_matches?: Json | null };
        Returns: undefined;
      };
      fnf_generate_teams: {
        Args: { p_tournament?: string | null; p_teams?: Json | null };
        Returns: undefined;
      };
      fnf_is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      fnf_remove_player: {
        Args: { p_tournament?: string | null; p_profile?: string | null };
        Returns: undefined;
      };
      fnf_report_match: {
        Args: { p_match?: string | null; p_games?: Json | null };
        Returns: Json;
      };
      fnf_reset: {
        Args: { p_tournament?: string | null };
        Returns: undefined;
      };
      fnf_set_rosters: {
        Args: { p_tournament?: string | null; p_rosters?: Json | null };
        Returns: undefined;
      };
      fnf_set_status: {
        Args: { p_tournament?: string | null; p_status?: string | null };
        Returns: undefined;
      };
      fnf_upsert_tournament: {
        Args: { p_id?: string | null; p_name?: string | null; p_swiss_rounds?: number | null; p_swiss_games?: number | null; p_playoff_best_of?: number | null; p_final_best_of?: number | null; p_playoff_cut?: number | null; p_starts_at?: string | null };
        Returns: string;
      };
      get_or_create_team_conversation: {
        Args: { p_team?: string | null };
        Returns: string;
      };
      handle_new_user: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_captain_of: {
        Args: { p_team?: string | null };
        Returns: boolean;
      };
      is_league_ops: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      make_draft_pick: {
        Args: { p_season?: string | null; p_profile?: string | null; p_auto?: boolean | null; p_duration?: number | null };
        Returns: string;
      };
      mark_conversation_read: {
        Args: { conv?: string | null };
        Returns: undefined;
      };
      purge_mock_data: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      seed_mock_players: {
        Args: { p_players?: Json | null };
        Returns: number;
      };
      set_updated_at: {
        Args: Record<string, never>;
        Returns: string;
      };
      shared_team: {
        Args: { a?: string | null; b?: string | null };
        Returns: boolean;
      };
      start_dm: {
        Args: { other?: string | null };
        Returns: string;
      };
      submit_asset: {
        Args: { p_kind?: string | null; p_source?: string | null; p_url?: string | null; p_storage_path?: string | null; p_title?: string | null; p_thumbnail_url?: string | null; p_mime_type?: string | null; p_size_bytes?: number | null; p_target_type?: string | null; p_target_id?: string | null; p_season_id?: string | null };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];

export type Profile = Tables<"profiles">;
export type HistoricalPlayerStatsRow = Tables<"historical_player_stats">;
export type Announcement = Tables<"announcements">;
export type Season = Tables<"seasons">;
