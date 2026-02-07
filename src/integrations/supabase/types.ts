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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          query_details: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          query_details?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          query_details?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      angel_bios: {
        Row: {
          angel_id: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          mission: string | null
          quote: string | null
          specialties: string[] | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          angel_id: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          mission?: string | null
          quote?: string | null
          specialties?: string[] | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          angel_id?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          mission?: string | null
          quote?: string | null
          specialties?: string[] | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      banned_users: {
        Row: {
          banned_at: string
          banned_by: string
          expires_at: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_at?: string
          banned_by: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_at?: string
          banned_by?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      breathing_session_history: {
        Row: {
          ambient_sound: string | null
          completed_at: string
          created_at: string
          duration_seconds: number
          id: string
          pattern_name: string
          user_id: string
        }
        Insert: {
          ambient_sound?: string | null
          completed_at?: string
          created_at?: string
          duration_seconds: number
          id?: string
          pattern_name: string
          user_id: string
        }
        Update: {
          ambient_sound?: string | null
          completed_at?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          pattern_name?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          public_consent: boolean
          role: string
          session_id: string
          user_id: string | null
          visibility: Database["public"]["Enums"]["chat_visibility"]
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          public_consent?: boolean
          role: string
          session_id: string
          user_id?: string | null
          visibility?: Database["public"]["Enums"]["chat_visibility"]
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          public_consent?: boolean
          role?: string
          session_id?: string
          user_id?: string | null
          visibility?: Database["public"]["Enums"]["chat_visibility"]
        }
        Relationships: []
      }
      conversation_summaries: {
        Row: {
          created_at: string
          emotional_tone: string | null
          id: string
          key_themes: string[] | null
          message_count: number
          session_id: string
          summary: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          emotional_tone?: string | null
          id?: string
          key_themes?: string[] | null
          message_count?: number
          session_id: string
          summary: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          emotional_tone?: string | null
          id?: string
          key_themes?: string[] | null
          message_count?: number
          session_id?: string
          summary?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          package_id: string | null
          payment_method: string | null
          payment_reference: string | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          package_id?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          package_id?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_breathing_patterns: {
        Row: {
          created_at: string
          exhale_duration: number
          hold_after_exhale: number | null
          hold_after_inhale: number | null
          id: string
          inhale_duration: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exhale_duration?: number
          hold_after_exhale?: number | null
          hold_after_inhale?: number | null
          id?: string
          inhale_duration?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exhale_duration?: number
          hold_after_exhale?: number | null
          hold_after_inhale?: number | null
          id?: string
          inhale_duration?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_minted: boolean
          is_public: boolean
          likes_count: number
          prompt: string
          token_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_minted?: boolean
          is_public?: boolean
          likes_count?: number
          prompt: string
          token_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_minted?: boolean
          is_public?: boolean
          likes_count?: number
          prompt?: string
          token_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gift_transactions: {
        Row: {
          amount: number
          bsc_tx_hash: string | null
          coin_type: Database["public"]["Enums"]["coin_type"]
          created_at: string
          id: string
          light_score_points: number | null
          message: string | null
          post_id: string | null
          receiver_id: string
          sender_id: string
          status: string
        }
        Insert: {
          amount: number
          bsc_tx_hash?: string | null
          coin_type?: Database["public"]["Enums"]["coin_type"]
          created_at?: string
          id?: string
          light_score_points?: number | null
          message?: string | null
          post_id?: string | null
          receiver_id: string
          sender_id: string
          status?: string
        }
        Update: {
          amount?: number
          bsc_tx_hash?: string | null
          coin_type?: Database["public"]["Enums"]["coin_type"]
          created_at?: string
          id?: string
          light_score_points?: number | null
          message?: string | null
          post_id?: string | null
          receiver_id?: string
          sender_id?: string
          status?: string
        }
        Relationships: []
      }
      greeting_history: {
        Row: {
          created_at: string
          greeting_message: string
          greeting_title: string
          id: string
          shown_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          greeting_message: string
          greeting_title: string
          id?: string
          shown_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          greeting_message?: string
          greeting_title?: string
          id?: string
          shown_date?: string
          user_id?: string
        }
        Relationships: []
      }
      group_chats: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          file_type: string | null
          file_url: string | null
          group_id: string
          id: string
          image_url: string | null
          reply_to_id: string | null
          sender_id: string
          sticker_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          group_id: string
          id?: string
          image_url?: string | null
          reply_to_id?: string | null
          sender_id: string
          sticker_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          group_id?: string
          id?: string
          image_url?: string | null
          reply_to_id?: string | null
          sender_id?: string
          sticker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "group_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      light_acknowledgements: {
        Row: {
          acknowledgement_type: string
          camly_coins: number
          created_at: string
          id: string
          is_public: boolean
          public_consent_confirmed: boolean
          source_id: string | null
          spiritual_message: string
          user_id: string
        }
        Insert: {
          acknowledgement_type: string
          camly_coins?: number
          created_at?: string
          id?: string
          is_public?: boolean
          public_consent_confirmed?: boolean
          source_id?: string | null
          spiritual_message: string
          user_id: string
        }
        Update: {
          acknowledgement_type?: string
          camly_coins?: number
          created_at?: string
          id?: string
          is_public?: boolean
          public_consent_confirmed?: boolean
          source_id?: string | null
          spiritual_message?: string
          user_id?: string
        }
        Relationships: []
      }
      light_behaviors: {
        Row: {
          analyzed_at: string
          behavior_type: string
          context: Json | null
          energy_type: string
          id: string
          sentiment_score: number
          user_id: string
        }
        Insert: {
          analyzed_at?: string
          behavior_type: string
          context?: Json | null
          energy_type?: string
          id?: string
          sentiment_score?: number
          user_id: string
        }
        Update: {
          analyzed_at?: string
          behavior_type?: string
          context?: Json | null
          energy_type?: string
          id?: string
          sentiment_score?: number
          user_id?: string
        }
        Relationships: []
      }
      light_interventions: {
        Row: {
          acknowledged: boolean
          angel_message: string | null
          created_at: string
          id: string
          intervention_type: string
          level: number
          reason: string
          user_id: string
        }
        Insert: {
          acknowledged?: boolean
          angel_message?: string | null
          created_at?: string
          id?: string
          intervention_type: string
          level?: number
          reason: string
          user_id: string
        }
        Update: {
          acknowledged?: boolean
          angel_message?: string | null
          created_at?: string
          id?: string
          intervention_type?: string
          level?: number
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      meditation_completions: {
        Row: {
          completed_at: string
          completed_date: string
          completion_percent: number
          id: string
          rewarded: boolean
          track_id: string
          track_name: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_date?: string
          completion_percent?: number
          id?: string
          rewarded?: boolean
          track_id: string
          track_name: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_date?: string
          completion_percent?: number
          id?: string
          rewarded?: boolean
          track_id?: string
          track_name?: string
          user_id?: string
        }
        Relationships: []
      }
      meditation_history: {
        Row: {
          ambient_sound: string | null
          completed_at: string
          created_at: string
          duration_seconds: number
          id: string
          theme: string | null
          user_id: string
        }
        Insert: {
          ambient_sound?: string | null
          completed_at?: string
          created_at?: string
          duration_seconds: number
          id?: string
          theme?: string | null
          user_id: string
        }
        Update: {
          ambient_sound?: string | null
          completed_at?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          theme?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meditation_reminders: {
        Row: {
          created_at: string
          id: string
          last_reminder_shown: string | null
          preferred_times: string[]
          reminders_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_reminder_shown?: string | null
          preferred_times?: string[]
          reminders_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_reminder_shown?: string | null
          preferred_times?: string[]
          reminders_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moment_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          moment_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          moment_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          moment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_comments_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "public_shared_light_moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moment_comments_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "shared_light_moments"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_likes: {
        Row: {
          created_at: string
          id: string
          moment_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          moment_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          moment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_likes_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "public_shared_light_moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moment_likes_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "shared_light_moments"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_reactions: {
        Row: {
          created_at: string | null
          id: string
          moment_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          moment_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          moment_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_reactions_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "public_shared_light_moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moment_reactions_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "shared_light_moments"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_entries: {
        Row: {
          activities: string[] | null
          ai_insight: string | null
          created_at: string
          emotions: string[] | null
          encrypted_data: string | null
          encryption_iv: string | null
          entry_date: string
          id: string
          is_encrypted: boolean | null
          mood_label: string
          mood_score: number
          note: string | null
          user_id: string
        }
        Insert: {
          activities?: string[] | null
          ai_insight?: string | null
          created_at?: string
          emotions?: string[] | null
          encrypted_data?: string | null
          encryption_iv?: string | null
          entry_date?: string
          id?: string
          is_encrypted?: boolean | null
          mood_label: string
          mood_score: number
          note?: string | null
          user_id: string
        }
        Update: {
          activities?: string[] | null
          ai_insight?: string | null
          created_at?: string
          emotions?: string[] | null
          encrypted_data?: string | null
          encryption_iv?: string | null
          entry_date?: string
          id?: string
          is_encrypted?: boolean | null
          mood_label?: string
          mood_score?: number
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mood_insights: {
        Row: {
          created_at: string
          id: string
          insight_text: string
          insight_type: string
          patterns_detected: Json | null
          period_end: string
          period_start: string
          recommendations: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          insight_text: string
          insight_type: string
          patterns_detected?: Json | null
          period_end: string
          period_start: string
          recommendations?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          insight_text?: string
          insight_type?: string
          patterns_detected?: Json | null
          period_end?: string
          period_start?: string
          recommendations?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      nft_transactions: {
        Row: {
          blockchain: string
          confirmed_at: string | null
          created_at: string
          gas_fee: number | null
          id: string
          image_id: string | null
          metadata: Json | null
          status: string
          token_id: string
          transaction_hash: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          blockchain?: string
          confirmed_at?: string | null
          created_at?: string
          gas_fee?: number | null
          id?: string
          image_id?: string | null
          metadata?: Json | null
          status?: string
          token_id: string
          transaction_hash: string
          user_id: string
          wallet_address: string
        }
        Update: {
          blockchain?: string
          confirmed_at?: string | null
          created_at?: string
          gas_fee?: number | null
          id?: string
          image_id?: string | null
          metadata?: Json | null
          status?: string
          token_id?: string
          transaction_hash?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_transactions_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "generated_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nft_transactions_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "public_generated_images"
            referencedColumns: ["id"]
          },
        ]
      }
      nine_path_community_votes: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          proof_id: string
          vote_type: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          proof_id: string
          vote_type: string
          voter_id: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          proof_id?: string
          vote_type?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nine_path_community_votes_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "nine_path_task_proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      nine_path_daily_tasks: {
        Row: {
          category: Database["public"]["Enums"]["nine_path_task_category"]
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          points_earned: number | null
          stage_id: number
          task_date: string
          task_description: string | null
          task_title: string
          updated_at: string
          user_id: string
          verification_level:
            | Database["public"]["Enums"]["nine_path_verification_level"]
            | null
        }
        Insert: {
          category: Database["public"]["Enums"]["nine_path_task_category"]
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          points_earned?: number | null
          stage_id: number
          task_date?: string
          task_description?: string | null
          task_title: string
          updated_at?: string
          user_id: string
          verification_level?:
            | Database["public"]["Enums"]["nine_path_verification_level"]
            | null
        }
        Update: {
          category?: Database["public"]["Enums"]["nine_path_task_category"]
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          points_earned?: number | null
          stage_id?: number
          task_date?: string
          task_description?: string | null
          task_title?: string
          updated_at?: string
          user_id?: string
          verification_level?:
            | Database["public"]["Enums"]["nine_path_verification_level"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "nine_path_daily_tasks_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "nine_path_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      nine_path_profiles: {
        Row: {
          birth_date: string
          created_at: string
          current_stage: number
          id: string
          onboarding_answers: Json | null
          onboarding_completed: boolean
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date: string
          created_at?: string
          current_stage?: number
          id?: string
          onboarding_answers?: Json | null
          onboarding_completed?: boolean
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string
          created_at?: string
          current_stage?: number
          id?: string
          onboarding_answers?: Json | null
          onboarding_completed?: boolean
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nine_path_stage_checklist: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          item_description: string | null
          item_title: string
          sort_order: number | null
          stage_id: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          item_description?: string | null
          item_title: string
          sort_order?: number | null
          stage_id: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          item_description?: string | null
          item_title?: string
          sort_order?: number | null
          stage_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nine_path_stage_checklist_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "nine_path_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      nine_path_stages: {
        Row: {
          awakening_focus: string | null
          created_at: string
          description_en: string
          description_vi: string
          healing_focus: string | null
          icon: string
          id: number
          name_en: string
          name_vi: string
          service_focus: string | null
          theme_color: string
        }
        Insert: {
          awakening_focus?: string | null
          created_at?: string
          description_en: string
          description_vi: string
          healing_focus?: string | null
          icon?: string
          id: number
          name_en: string
          name_vi: string
          service_focus?: string | null
          theme_color?: string
        }
        Update: {
          awakening_focus?: string | null
          created_at?: string
          description_en?: string
          description_vi?: string
          healing_focus?: string | null
          icon?: string
          id?: number
          name_en?: string
          name_vi?: string
          service_focus?: string | null
          theme_color?: string
        }
        Relationships: []
      }
      nine_path_task_proofs: {
        Row: {
          community_votes: number | null
          created_at: string
          id: string
          image_urls: string[] | null
          is_verified: boolean | null
          proof_text: string | null
          required_votes: number | null
          task_id: string
          updated_at: string
          user_id: string
          verification_level: Database["public"]["Enums"]["nine_path_verification_level"]
          verified_at: string | null
          video_url: string | null
        }
        Insert: {
          community_votes?: number | null
          created_at?: string
          id?: string
          image_urls?: string[] | null
          is_verified?: boolean | null
          proof_text?: string | null
          required_votes?: number | null
          task_id: string
          updated_at?: string
          user_id: string
          verification_level?: Database["public"]["Enums"]["nine_path_verification_level"]
          verified_at?: string | null
          video_url?: string | null
        }
        Update: {
          community_votes?: number | null
          created_at?: string
          id?: string
          image_urls?: string[] | null
          is_verified?: boolean | null
          proof_text?: string | null
          required_votes?: number | null
          task_id?: string
          updated_at?: string
          user_id?: string
          verification_level?: Database["public"]["Enums"]["nine_path_verification_level"]
          verified_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nine_path_task_proofs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "nine_path_daily_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          reference_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      privacy_settings: {
        Row: {
          created_at: string
          id: string
          notify_profile_views: boolean
          online_status_visibility: string
          online_visible: boolean | null
          profile_visibility: string
          show_last_seen: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notify_profile_views?: boolean
          online_status_visibility?: string
          online_visible?: boolean | null
          profile_visibility?: string
          show_last_seen?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notify_profile_views?: boolean
          online_status_visibility?: string
          online_visible?: boolean | null
          profile_visibility?: string
          show_last_seen?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      private_messages: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          image_url: string | null
          is_read: boolean
          receiver_id: string
          reply_to_id: string | null
          sender_id: string
          sticker_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean
          receiver_id: string
          reply_to_id?: string | null
          sender_id: string
          sticker_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean
          receiver_id?: string
          reply_to_id?: string | null
          sender_id?: string
          sticker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "private_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "private_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          profile_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          profile_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agreed_to_light_law: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          encryption_salt: string | null
          id: string
          light_law_agreed_at: string | null
          updated_at: string
        }
        Insert: {
          agreed_to_light_law?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          encryption_salt?: string | null
          id: string
          light_law_agreed_at?: string | null
          updated_at?: string
        }
        Update: {
          agreed_to_light_law?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          encryption_salt?: string | null
          id?: string
          light_law_agreed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      reflection_notes: {
        Row: {
          approved: boolean
          content: string
          created_at: string
          id: string
          is_public: boolean
          public_consent_confirmed: boolean
          rejection_reason: string | null
          sincerity_score: number | null
          user_id: string
          word_count: number
        }
        Insert: {
          approved?: boolean
          content: string
          created_at?: string
          id?: string
          is_public?: boolean
          public_consent_confirmed?: boolean
          rejection_reason?: string | null
          sincerity_score?: number | null
          user_id: string
          word_count?: number
        }
        Update: {
          approved?: boolean
          content?: string
          created_at?: string
          id?: string
          is_public?: boolean
          public_consent_confirmed?: boolean
          rejection_reason?: string | null
          sincerity_score?: number | null
          user_id?: string
          word_count?: number
        }
        Relationships: []
      }
      reward_ledger: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          created_by: string
          description: string
          id: string
          ip_address: string | null
          is_admin_action: boolean
          reference_id: string | null
          reward_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          created_by: string
          description: string
          id?: string
          ip_address?: string | null
          is_admin_action?: boolean
          reference_id?: string | null
          reward_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          ip_address?: string | null
          is_admin_action?: boolean
          reference_id?: string | null
          reward_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_greetings: {
        Row: {
          created_at: string
          greeting_history_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          greeting_history_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          greeting_history_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_greetings_greeting_history_id_fkey"
            columns: ["greeting_history_id"]
            isOneToOne: false
            referencedRelation: "greeting_history"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_moments: {
        Row: {
          created_at: string
          id: string
          moment_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          moment_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          moment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_moments_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "public_shared_light_moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_moments_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "shared_light_moments"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          created_at: string
          details: Json | null
          endpoint: string | null
          event_severity: string
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          endpoint?: string | null
          event_severity?: string
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          endpoint?: string | null
          event_severity?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shared_conversations: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_viewed_at: string | null
          messages: Json
          share_id: string
          title: string | null
          user_id: string
          view_count: number | null
          visibility: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_viewed_at?: string | null
          messages: Json
          share_id: string
          title?: string | null
          user_id: string
          view_count?: number | null
          visibility?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_viewed_at?: string | null
          messages?: Json
          share_id?: string
          title?: string | null
          user_id?: string
          view_count?: number | null
          visibility?: string
        }
        Relationships: []
      }
      shared_light_moments: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          image_url: string | null
          light_acknowledgement_id: string | null
          likes_count: number
          moment_type: string
          spiritual_message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          image_url?: string | null
          light_acknowledgement_id?: string | null
          likes_count?: number
          moment_type: string
          spiritual_message: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          image_url?: string | null
          light_acknowledgement_id?: string | null
          likes_count?: number
          moment_type?: string
          spiritual_message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_light_moments_light_acknowledgement_id_fkey"
            columns: ["light_acknowledgement_id"]
            isOneToOne: false
            referencedRelation: "light_acknowledgements"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonial_comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "testimonial_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonial_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          testimonial_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          testimonial_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          testimonial_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "testimonial_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_comments_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonial_likes: {
        Row: {
          created_at: string
          id: string
          testimonial_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          testimonial_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          testimonial_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_likes_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonial_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          testimonial_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          testimonial_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          testimonial_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_reactions_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonial_tags: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          comments_count: number
          created_at: string | null
          id: string
          image_url: string | null
          is_approved: boolean | null
          is_featured: boolean | null
          likes_count: number
          tags: string[] | null
          testimony: string
          updated_at: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          comments_count?: number
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          likes_count?: number
          tags?: string[] | null
          testimony: string
          updated_at?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          comments_count?: number
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          likes_count?: number
          tags?: string[] | null
          testimony?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      typing_status: {
        Row: {
          chat_partner_id: string
          id: string
          is_typing: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_partner_id: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_partner_id?: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      universe_message_comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "universe_message_comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "universe_message_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      universe_message_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          message_id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_id: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "universe_message_comments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "universe_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universe_message_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "universe_message_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      universe_message_likes: {
        Row: {
          created_at: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "universe_message_likes_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "universe_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      universe_messages: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: string
          image_urls: string[] | null
          likes_count: number
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          likes_count?: number
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          likes_count?: number
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_camly_coins: {
        Row: {
          created_at: string
          id: string
          lifetime_coins: number
          total_coins: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_coins?: number
          total_coins?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_coins?: number
          total_coins?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_daily_greetings: {
        Row: {
          created_at: string
          digest_notifications_enabled: boolean
          greeting_count: number
          greeting_enabled: boolean
          id: string
          last_greeting_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          digest_notifications_enabled?: boolean
          greeting_count?: number
          greeting_enabled?: boolean
          id?: string
          last_greeting_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          digest_notifications_enabled?: boolean
          greeting_count?: number
          greeting_enabled?: boolean
          id?: string
          last_greeting_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_light_profile: {
        Row: {
          created_at: string
          energy_direction: string
          id: string
          last_light_check: string | null
          light_score: number
          onboarding_answers: Json | null
          onboarding_completed: boolean
          updated_at: string
          user_id: string
          warning_level: number
        }
        Insert: {
          created_at?: string
          energy_direction?: string
          id?: string
          last_light_check?: string | null
          light_score?: number
          onboarding_answers?: Json | null
          onboarding_completed?: boolean
          updated_at?: string
          user_id: string
          warning_level?: number
        }
        Update: {
          created_at?: string
          energy_direction?: string
          id?: string
          last_light_check?: string | null
          light_score?: number
          onboarding_answers?: Json | null
          onboarding_completed?: boolean
          updated_at?: string
          user_id?: string
          warning_level?: number
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          context: string | null
          created_at: string
          id: string
          importance_score: number | null
          last_referenced_at: string | null
          memory_key: string
          memory_type: string
          memory_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          importance_score?: number | null
          last_referenced_at?: string | null
          memory_key: string
          memory_type: string
          memory_value: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          importance_score?: number | null
          last_referenced_at?: string | null
          memory_key?: string
          memory_type?: string
          memory_value?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          angel_cursor_color: string | null
          angel_cursor_enabled: boolean | null
          angel_cursor_size: string | null
          angel_cursor_video_url: string | null
          angel_presence_settings: Json | null
          created_at: string | null
          id: string
          theme: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          angel_cursor_color?: string | null
          angel_cursor_enabled?: boolean | null
          angel_cursor_size?: string | null
          angel_cursor_video_url?: string | null
          angel_presence_settings?: Json | null
          created_at?: string | null
          id?: string
          theme?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          angel_cursor_color?: string | null
          angel_cursor_enabled?: boolean | null
          angel_cursor_size?: string | null
          angel_cursor_video_url?: string | null
          angel_presence_settings?: Json | null
          created_at?: string | null
          id?: string
          theme?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          id: string
          is_online: boolean
          last_seen: string
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean
          last_seen?: string
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_testimonial_badges: {
        Row: {
          badge_type: Database["public"]["Enums"]["testimonial_badge_type"]
          id: string
          testimonial_id: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_type: Database["public"]["Enums"]["testimonial_badge_type"]
          id?: string
          testimonial_id?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["testimonial_badge_type"]
          id?: string
          testimonial_id?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_testimonial_badges_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallets: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          wallet_address: string
          wallet_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
          wallet_type?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: string
          blockchain: string
          confirmed_at: string | null
          created_at: string
          gas_used: string | null
          id: string
          network_id: string
          status: string
          to_address: string
          token_symbol: string
          transaction_hash: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: string
          blockchain?: string
          confirmed_at?: string | null
          created_at?: string
          gas_used?: string | null
          id?: string
          network_id: string
          status?: string
          to_address: string
          token_symbol?: string
          transaction_hash?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: string
          blockchain?: string
          confirmed_at?: string | null
          created_at?: string
          gas_used?: string | null
          id?: string
          network_id?: string
          status?: string
          to_address?: string
          token_symbol?: string
          transaction_hash?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_event_aggregates: {
        Row: {
          event_count: number | null
          event_date: string | null
          event_severity: string | null
          event_type: string | null
        }
        Relationships: []
      }
      public_generated_images: {
        Row: {
          created_at: string | null
          id: string | null
          image_url: string | null
          is_minted: boolean | null
          is_public: boolean | null
          likes_count: number | null
          prompt: string | null
          token_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          image_url?: string | null
          is_minted?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          prompt?: string | null
          token_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          image_url?: string | null
          is_minted?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          prompt?: string | null
          token_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          light_score: number | null
        }
        Relationships: []
      }
      public_shared_light_moments: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string | null
          image_url: string | null
          light_acknowledgement_id: string | null
          likes_count: number | null
          moment_type: string | null
          spiritual_message: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          image_url?: string | null
          light_acknowledgement_id?: string | null
          likes_count?: number | null
          moment_type?: string | null
          spiritual_message?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          image_url?: string | null
          light_acknowledgement_id?: string | null
          likes_count?: number | null
          moment_type?: string | null
          spiritual_message?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_light_moments_light_acknowledgement_id_fkey"
            columns: ["light_acknowledgement_id"]
            isOneToOne: false
            referencedRelation: "light_acknowledgements"
            referencedColumns: ["id"]
          },
        ]
      }
      safe_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
      top_sponsors: {
        Row: {
          avatar_url: string | null
          coin_type: Database["public"]["Enums"]["coin_type"] | null
          display_name: string | null
          sender_id: string | null
          total_amount: number | null
          total_gifts: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_description: string
          p_package_id?: string
          p_payment_method?: string
          p_payment_reference?: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: string
      }
      add_reward_ledger_entry: {
        Args: {
          p_amount: number
          p_description: string
          p_ip_address?: string
          p_is_admin_action?: boolean
          p_reference_id?: string
          p_reward_type: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      are_users_blocked: {
        Args: { user1: string; user2: string }
        Returns: boolean
      }
      award_camly_coins: {
        Args: {
          p_coins: number
          p_is_public?: boolean
          p_message: string
          p_source_id?: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      can_view_online_status: {
        Args: { target_user_id: string; viewer_id: string }
        Returns: boolean
      }
      can_view_profile: {
        Args: { target_user_id: string; viewer_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      generate_encryption_salt: { Args: never; Returns: string }
      get_admin_event_stats: {
        Args: { p_days?: number }
        Returns: {
          event_count: number
          event_date: string
          event_severity: string
          event_type: string
        }[]
      }
      get_behavior_stats: {
        Args: { p_days?: number }
        Returns: {
          avg_sentiment: number
          behavior_count: number
          behavior_date: string
          behavior_type: string
          energy_type: string
        }[]
      }
      get_leaderboard_safe: {
        Args: { p_category: string; p_limit?: number }
        Returns: {
          avatar_url: string
          display_name: string
          id: string
          score: number
        }[]
      }
      get_profile_safe: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          id: string
        }[]
      }
      get_security_stats: {
        Args: { p_hours?: number }
        Returns: {
          critical_count: number
          failed_auth_count: number
          rate_limit_count: number
          suspicious_count: number
          total_events: number
          unique_ips: number
        }[]
      }
      get_shared_conversation: {
        Args: { p_share_id: string }
        Returns: {
          created_at: string
          id: string
          messages: Json
          share_id: string
          title: string
          view_count: number
          visibility: string
        }[]
      }
      get_shared_conversation_by_share_id: {
        Args: { p_share_id: string }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          messages: Json
          share_id: string
          title: string
          user_id: string
          view_count: number
          visibility: string
        }[]
      }
      get_testimonial_reaction_counts: {
        Args: { p_testimonial_id: string }
        Returns: {
          count: number
          reaction_type: string
        }[]
      }
      get_user_presence_safe: {
        Args: { p_target_user_id: string }
        Returns: {
          is_online: boolean
          last_seen: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_share_view: { Args: { p_share_id: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_group_admin: { Args: { p_group_id: string }; Returns: boolean }
      is_group_creator: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_service_role: { Args: never; Returns: boolean }
      log_security_event: {
        Args: {
          p_details?: Json
          p_endpoint?: string
          p_event_severity?: string
          p_event_type: string
          p_ip_address?: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      record_credit_usage: {
        Args: { p_amount: number; p_description?: string; p_user_id: string }
        Returns: string
      }
      search_users_safe: {
        Args: { p_limit?: number; p_offset?: number; p_search_term: string }
        Returns: {
          avatar_url: string
          display_name: string
          id: string
          light_score: number
        }[]
      }
      soft_delete_message: { Args: { p_message_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      chat_visibility: "private" | "public" | "unlisted"
      coin_type: "camly_coin" | "fun_money" | "bnb" | "usdt"
      nine_path_task_category: "healing" | "awakening" | "service"
      nine_path_verification_level:
        | "self_claim"
        | "proof"
        | "community_witness"
        | "impact_verified"
      testimonial_badge_type:
        | "first_story"
        | "popular"
        | "viral"
        | "conversational"
        | "featured"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      chat_visibility: ["private", "public", "unlisted"],
      coin_type: ["camly_coin", "fun_money", "bnb", "usdt"],
      nine_path_task_category: ["healing", "awakening", "service"],
      nine_path_verification_level: [
        "self_claim",
        "proof",
        "community_witness",
        "impact_verified",
      ],
      testimonial_badge_type: [
        "first_story",
        "popular",
        "viral",
        "conversational",
        "featured",
      ],
    },
  },
} as const
