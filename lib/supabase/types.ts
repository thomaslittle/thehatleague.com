export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          created_at: string
          id: number
          kind: string
          pinned: boolean
          posted_by: string | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: number
          kind?: string
          pinned?: boolean
          posted_by?: string | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: number
          kind?: string
          pinned?: boolean
          posted_by?: string | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          approved: boolean
          created_at: string
          id: string
          kind: string
          mime_type: string | null
          profile_id: string
          season_id: string | null
          size_bytes: number | null
          source: string
          storage_path: string | null
          target_id: string
          target_type: string
          thumbnail_url: string | null
          title: string | null
          url: string
          votes: number
        }
        Insert: {
          approved?: boolean
          created_at?: string
          id?: string
          kind?: string
          mime_type?: string | null
          profile_id: string
          season_id?: string | null
          size_bytes?: number | null
          source?: string
          storage_path?: string | null
          target_id: string
          target_type: string
          thumbnail_url?: string | null
          title?: string | null
          url: string
          votes?: number
        }
        Update: {
          approved?: boolean
          created_at?: string
          id?: string
          kind?: string
          mime_type?: string | null
          profile_id?: string
          season_id?: string | null
          size_bytes?: number | null
          source?: string
          storage_path?: string | null
          target_id?: string
          target_type?: string
          thumbnail_url?: string | null
          title?: string | null
          url?: string
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "assets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          created_at: string
          criteria: Json
          criteria_type: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          tier: string
        }
        Insert: {
          category?: string
          created_at?: string
          criteria?: Json
          criteria_type?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          tier?: string
        }
        Update: {
          category?: string
          created_at?: string
          criteria?: Json
          criteria_type?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          tier?: string
        }
        Relationships: []
      }
      clips: {
        Row: {
          approved: boolean
          created_at: string
          id: string
          match_id: string | null
          profile_id: string
          season_id: string | null
          thumbnail_url: string | null
          title: string | null
          url: string
          votes: number
        }
        Insert: {
          approved?: boolean
          created_at?: string
          id?: string
          match_id?: string | null
          profile_id: string
          season_id?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url: string
          votes?: number
        }
        Update: {
          approved?: boolean
          created_at?: string
          id?: string
          match_id?: string | null
          profile_id?: string
          season_id?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url?: string
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "clips_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clips_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clips_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      combine_profiles: {
        Row: {
          availability: string | null
          clip_urls: string[]
          id: string
          notes: string | null
          preferred_role: string | null
          profile_id: string
          season_id: string
          secondary_role: string | null
          showcase_clip_url: string | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          availability?: string | null
          clip_urls?: string[]
          id?: string
          notes?: string | null
          preferred_role?: string | null
          profile_id: string
          season_id: string
          secondary_role?: string | null
          showcase_clip_url?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          availability?: string | null
          clip_urls?: string[]
          id?: string
          notes?: string | null
          preferred_role?: string | null
          profile_id?: string
          season_id?: string
          secondary_role?: string | null
          showcase_clip_url?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "combine_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combine_profiles_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          profile_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          profile_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_reads: {
        Row: {
          conversation_id: string
          last_read_at: string
          profile_id: string
        }
        Insert: {
          conversation_id: string
          last_read_at?: string
          profile_id: string
        }
        Update: {
          conversation_id?: string
          last_read_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_reads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_reads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          kind: string
          last_message_at: string | null
          team_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          last_message_at?: string | null
          team_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          last_message_at?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "conversations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_order: {
        Row: {
          created_at: string
          id: string
          position: number
          season_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position: number
          season_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          season_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_order_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_order_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "draft_order_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_picks: {
        Row: {
          auto_picked: boolean
          id: string
          overall_pick: number
          pick_duration_ms: number | null
          pick_in_round: number
          picked_at: string
          picked_by: string | null
          profile_id: string
          round: number
          season_id: string
          team_id: string
        }
        Insert: {
          auto_picked?: boolean
          id?: string
          overall_pick: number
          pick_duration_ms?: number | null
          pick_in_round: number
          picked_at?: string
          picked_by?: string | null
          profile_id: string
          round: number
          season_id: string
          team_id: string
        }
        Update: {
          auto_picked?: boolean
          id?: string
          overall_pick?: number
          pick_duration_ms?: number | null
          pick_in_round?: number
          picked_at?: string
          picked_by?: string | null
          profile_id?: string
          round?: number
          season_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_picks_picked_by_fkey"
            columns: ["picked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_picks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_picks_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_picks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "draft_picks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_queues: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          rank: number
          season_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          rank: number
          season_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          rank?: number
          season_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_queues_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_queues_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_queues_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "draft_queues_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_state: {
        Row: {
          created_at: string
          current_overall_pick: number
          current_round: number
          id: string
          is_paused: boolean
          last_pick_id: string | null
          on_clock_team_id: string | null
          paused_remaining_ms: number | null
          pick_ends_at: string | null
          season_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_overall_pick?: number
          current_round?: number
          id?: string
          is_paused?: boolean
          last_pick_id?: string | null
          on_clock_team_id?: string | null
          paused_remaining_ms?: number | null
          pick_ends_at?: string | null
          season_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_overall_pick?: number
          current_round?: number
          id?: string
          is_paused?: boolean
          last_pick_id?: string | null
          on_clock_team_id?: string | null
          paused_remaining_ms?: number | null
          pick_ends_at?: string | null
          season_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_state_last_pick_id_fkey"
            columns: ["last_pick_id"]
            isOneToOne: false
            referencedRelation: "draft_picks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_state_on_clock_team_id_fkey"
            columns: ["on_clock_team_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "draft_state_on_clock_team_id_fkey"
            columns: ["on_clock_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_state_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: true
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_player_stats: {
        Row: {
          assists: number
          conference: string
          created_at: string
          deleted: number
          demos: number
          goals: number
          id: number
          player_name: string
          saves: number
          season: number
        }
        Insert: {
          assists?: number
          conference: string
          created_at?: string
          deleted?: number
          demos?: number
          goals?: number
          id?: number
          player_name: string
          saves?: number
          season: number
        }
        Update: {
          assists?: number
          conference?: string
          created_at?: string
          deleted?: number
          demos?: number
          goals?: number
          id?: number
          player_name?: string
          saves?: number
          season?: number
        }
        Relationships: []
      }
      match_games: {
        Row: {
          away_goals: number
          ballchasing_id: string | null
          created_at: string
          game_number: number
          home_goals: number
          id: string
          match_id: string
          replay_url: string | null
        }
        Insert: {
          away_goals?: number
          ballchasing_id?: string | null
          created_at?: string
          game_number: number
          home_goals?: number
          id?: string
          match_id: string
          replay_url?: string | null
        }
        Update: {
          away_goals?: number
          ballchasing_id?: string | null
          created_at?: string
          game_number?: number
          home_goals?: number
          id?: string
          match_id?: string
          replay_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_games_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_predictions: {
        Row: {
          created_at: string
          id: string
          match_id: string
          predicted_away_score: number | null
          predicted_home_score: number | null
          predicted_winner_team_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          predicted_away_score?: number | null
          predicted_home_score?: number | null
          predicted_winner_team_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          predicted_away_score?: number | null
          predicted_home_score?: number | null
          predicted_winner_team_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_predictions_predicted_winner_team_id_fkey"
            columns: ["predicted_winner_team_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "match_predictions_predicted_winner_team_id_fkey"
            columns: ["predicted_winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_predictions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number
          away_team_id: string
          best_of: number
          bracket: string | null
          challonge_url: string | null
          conference: string | null
          created_at: string
          home_score: number
          home_team_id: string
          id: string
          round_label: string | null
          scheduled_at: string | null
          season_id: string
          status: string
          updated_at: string
          week: number | null
          winner_team_id: string | null
        }
        Insert: {
          away_score?: number
          away_team_id: string
          best_of?: number
          bracket?: string | null
          challonge_url?: string | null
          conference?: string | null
          created_at?: string
          home_score?: number
          home_team_id: string
          id?: string
          round_label?: string | null
          scheduled_at?: string | null
          season_id: string
          status?: string
          updated_at?: string
          week?: number | null
          winner_team_id?: string | null
        }
        Update: {
          away_score?: number
          away_team_id?: string
          best_of?: number
          bracket?: string | null
          challonge_url?: string | null
          conference?: string | null
          created_at?: string
          home_score?: number
          home_team_id?: string
          id?: string
          round_label?: string | null
          scheduled_at?: string | null
          season_id?: string
          status?: string
          updated_at?: string
          week?: number | null
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mvp_votes: {
        Row: {
          created_at: string
          id: string
          match_id: string
          profile_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          profile_id: string
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          profile_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mvp_votes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_votes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      overlay_settings: {
        Row: {
          accent: string | null
          active_scene: string
          created_at: string
          extras: Json
          id: string
          lower_third: string | null
          overlay_token: string
          reveal_seconds: number
          reveal_sound: boolean
          season_id: string
          show_on_deck: boolean
          show_recent_picks: boolean
          show_timer: boolean
          theme: string
          ticker_text: string | null
          updated_at: string
        }
        Insert: {
          accent?: string | null
          active_scene?: string
          created_at?: string
          extras?: Json
          id?: string
          lower_third?: string | null
          overlay_token?: string
          reveal_seconds?: number
          reveal_sound?: boolean
          season_id: string
          show_on_deck?: boolean
          show_recent_picks?: boolean
          show_timer?: boolean
          theme?: string
          ticker_text?: string | null
          updated_at?: string
        }
        Update: {
          accent?: string | null
          active_scene?: string
          created_at?: string
          extras?: Json
          id?: string
          lower_third?: string | null
          overlay_token?: string
          reveal_seconds?: number
          reveal_sound?: boolean
          season_id?: string
          show_on_deck?: boolean
          show_recent_picks?: boolean
          show_timer?: boolean
          theme?: string
          ticker_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "overlay_settings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: true
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      player_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          context: Json
          id: string
          profile_id: string
          season_id: string | null
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          context?: Json
          id?: string
          profile_id: string
          season_id?: string | null
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          context?: Json
          id?: string
          profile_id?: string
          season_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_badges_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          assists: number
          created_at: string
          demos: number
          goals: number
          id: string
          match_id: string | null
          profile_id: string
          saves: number
          score: number
          season_id: string
        }
        Insert: {
          assists?: number
          created_at?: string
          demos?: number
          goals?: number
          id?: string
          match_id?: string | null
          profile_id: string
          saves?: number
          score?: number
          season_id: string
        }
        Update: {
          assists?: number
          created_at?: string
          demos?: number
          goals?: number
          id?: string
          match_id?: string | null
          profile_id?: string
          saves?: number
          score?: number
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_stats_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      point_events: {
        Row: {
          created_at: string
          id: string
          note: string | null
          points: number
          profile_id: string
          ref_id: string | null
          ref_type: string | null
          season_id: string | null
          source: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          points: number
          profile_id: string
          ref_id?: string | null
          ref_type?: string | null
          season_id?: string | null
          source: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          points?: number
          profile_id?: string
          ref_id?: string | null
          ref_type?: string | null
          season_id?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_events_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      power_rankings: {
        Row: {
          blurb: string | null
          created_at: string
          id: string
          previous_rank: number | null
          rank: number
          season_id: string
          team_id: string
          week: number
        }
        Insert: {
          blurb?: string | null
          created_at?: string
          id?: string
          previous_rank?: number | null
          rank: number
          season_id: string
          team_id: string
          week: number
        }
        Update: {
          blurb?: string | null
          created_at?: string
          id?: string
          previous_rank?: number | null
          rank?: number
          season_id?: string
          team_id?: string
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "power_rankings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "power_rankings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "power_rankings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_rank_history: {
        Row: {
          captured_at: string
          id: string
          peak_rank: string | null
          profile_id: string
          rank_2v2: string | null
          rank_3v3: string | null
        }
        Insert: {
          captured_at?: string
          id?: string
          peak_rank?: string | null
          profile_id: string
          rank_2v2?: string | null
          rank_3v3?: string | null
        }
        Update: {
          captured_at?: string
          id?: string
          peak_rank?: string | null
          profile_id?: string
          rank_2v2?: string | null
          rank_3v3?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_rank_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_pitch: string | null
          bio: string | null
          captain_pitch: string | null
          created_at: string
          discord_avatar_url: string | null
          discord_global_name: string | null
          discord_id: string | null
          discord_username: string | null
          id: string
          in_player_pool: boolean
          is_admin: boolean
          is_admin_applicant: boolean
          is_captain: boolean
          is_captain_applicant: boolean
          is_developer: boolean
          is_mock: boolean
          peak_rank: string | null
          peak_rank_playlist: string | null
          profile_avatar_url: string | null
          profile_banner_url: string | null
          rank_2v2: string | null
          rank_3v3: string | null
          ranks_updated_at: string | null
          rl_tracker_url: string | null
          social_links: Json
          updated_at: string
        }
        Insert: {
          admin_pitch?: string | null
          bio?: string | null
          captain_pitch?: string | null
          created_at?: string
          discord_avatar_url?: string | null
          discord_global_name?: string | null
          discord_id?: string | null
          discord_username?: string | null
          id: string
          in_player_pool?: boolean
          is_admin?: boolean
          is_admin_applicant?: boolean
          is_captain?: boolean
          is_captain_applicant?: boolean
          is_developer?: boolean
          is_mock?: boolean
          peak_rank?: string | null
          peak_rank_playlist?: string | null
          profile_avatar_url?: string | null
          profile_banner_url?: string | null
          rank_2v2?: string | null
          rank_3v3?: string | null
          ranks_updated_at?: string | null
          rl_tracker_url?: string | null
          social_links?: Json
          updated_at?: string
        }
        Update: {
          admin_pitch?: string | null
          bio?: string | null
          captain_pitch?: string | null
          created_at?: string
          discord_avatar_url?: string | null
          discord_global_name?: string | null
          discord_id?: string | null
          discord_username?: string | null
          id?: string
          in_player_pool?: boolean
          is_admin?: boolean
          is_admin_applicant?: boolean
          is_captain?: boolean
          is_captain_applicant?: boolean
          is_developer?: boolean
          is_mock?: boolean
          peak_rank?: string | null
          peak_rank_playlist?: string | null
          profile_avatar_url?: string | null
          profile_banner_url?: string | null
          rank_2v2?: string | null
          rank_3v3?: string | null
          ranks_updated_at?: string | null
          rl_tracker_url?: string | null
          social_links?: Json
          updated_at?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          combine_at: string | null
          conferences: string[]
          created_at: string
          draft_at: string | null
          draft_settings: Json
          ends_at: string | null
          id: string
          is_active: boolean
          name: string
          regular_starts_at: string | null
          slug: string
          starts_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          combine_at?: string | null
          conferences?: string[]
          created_at?: string
          draft_at?: string | null
          draft_settings?: Json
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          regular_starts_at?: string | null
          slug: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          combine_at?: string | null
          conferences?: string[]
          created_at?: string
          draft_at?: string | null
          draft_settings?: Json
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          regular_starts_at?: string | null
          slug?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          drafted_at: string | null
          id: string
          is_captain: boolean
          overall_pick: number | null
          profile_id: string
          round: number | null
          season_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          drafted_at?: string | null
          id?: string
          is_captain?: boolean
          overall_pick?: number | null
          profile_id: string
          round?: number | null
          season_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          drafted_at?: string | null
          id?: string
          is_captain?: boolean
          overall_pick?: number | null
          profile_id?: string
          round?: number | null
          season_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "standings_view"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          captain_id: string | null
          color: string | null
          conference: string | null
          created_at: string
          draft_position: number | null
          id: string
          logo_url: string | null
          name: string
          season_id: string
          seed: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          captain_id?: string | null
          color?: string | null
          conference?: string | null
          created_at?: string
          draft_position?: number | null
          id?: string
          logo_url?: string | null
          name: string
          season_id: string
          seed?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          captain_id?: string | null
          color?: string | null
          conference?: string | null
          created_at?: string
          draft_position?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          season_id?: string
          seed?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      player_points_view: {
        Row: {
          points: number | null
          profile_id: string | null
          season_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_events_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      player_season_stats: {
        Row: {
          assists: number | null
          demos: number | null
          games_played: number | null
          goals: number | null
          profile_id: string | null
          saves: number | null
          score: number | null
          season_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_stats_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      standings_view: {
        Row: {
          captain_id: string | null
          color: string | null
          conference: string | null
          diff: number | null
          ga: number | null
          gf: number | null
          gp: number | null
          l: number | null
          name: string | null
          season_id: string | null
          slug: string | null
          team_id: string | null
          w: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      are_friends: { Args: { a: string; b: string }; Returns: boolean }
      can_access_conversation: { Args: { conv: string }; Returns: boolean }
      can_dm: { Args: { a: string; b: string }; Returns: boolean }
      draft_picks_per_team: { Args: { p_season: string }; Returns: number }
      draft_team_at: {
        Args: { p_overall: number; p_season: string }
        Returns: string
      }
      get_or_create_team_conversation: {
        Args: { p_team: string }
        Returns: string
      }
      is_captain_of: { Args: { p_team: string }; Returns: boolean }
      is_league_ops: { Args: never; Returns: boolean }
      make_draft_pick: {
        Args: {
          p_auto?: boolean
          p_duration?: number
          p_profile: string
          p_season: string
        }
        Returns: string
      }
      mark_conversation_read: { Args: { conv: string }; Returns: undefined }
      purge_mock_data: { Args: never; Returns: undefined }
      seed_mock_players: { Args: { p_players: Json }; Returns: number }
      shared_team: { Args: { a: string; b: string }; Returns: boolean }
      start_dm: { Args: { other: string }; Returns: string }
      submit_asset: {
        Args: {
          p_kind: string
          p_mime_type: string
          p_season_id: string
          p_size_bytes: number
          p_source: string
          p_storage_path: string
          p_target_id: string
          p_target_type: string
          p_thumbnail_url: string
          p_title: string
          p_url: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


// ── Convenience row aliases ──────────────────────────────────────────────
export type Profile = Tables<"profiles">;
export type HistoricalPlayerStatsRow = Tables<"historical_player_stats">;
export type Announcement = Tables<"announcements">;
export type Season = Tables<"seasons">;
export type Team = Tables<"teams">;
export type TeamMember = Tables<"team_members">;
export type DraftState = Tables<"draft_state">;
export type DraftPick = Tables<"draft_picks">;
export type DraftOrderRow = Tables<"draft_order">;
export type DraftQueueRow = Tables<"draft_queues">;
export type CombineProfile = Tables<"combine_profiles">;
export type MatchRow = Tables<"matches">;
export type MatchGame = Tables<"match_games">;
export type PowerRanking = Tables<"power_rankings">;
export type Badge = Tables<"badges">;
export type PlayerBadge = Tables<"player_badges">;
export type PointEvent = Tables<"point_events">;
export type MvpVote = Tables<"mvp_votes">;
export type Clip = Tables<"clips">;
export type MatchPrediction = Tables<"match_predictions">;
export type PlayerStat = Tables<"player_stats">;
export type ProfileRankHistory = Tables<"profile_rank_history">;
export type OverlaySettings = Tables<"overlay_settings">;
export type StandingsRow = Tables<"standings_view">;
export type PlayerSeasonStats = Tables<"player_season_stats">;
// social + assets
export type Friendship = Tables<"friendships">;
export type Conversation = Tables<"conversations">;
export type ConversationParticipant = Tables<"conversation_participants">;
export type ConversationRead = Tables<"conversation_reads">;
export type Message = Tables<"messages">;
export type Asset = Tables<"assets">;
