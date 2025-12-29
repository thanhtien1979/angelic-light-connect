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
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
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
      testimonials: {
        Row: {
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          testimony: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          testimony: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          testimony?: string
          updated_at?: string | null
          user_id?: string
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
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          theme: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          theme?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
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
        }
        Relationships: []
      }
      public_shared_light_moments: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string | null
          light_acknowledgement_id: string | null
          likes_count: number | null
          moment_type: string | null
          spiritual_message: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          light_acknowledgement_id?: string | null
          likes_count?: number | null
          moment_type?: string | null
          spiritual_message?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          light_acknowledgement_id?: string | null
          likes_count?: number | null
          moment_type?: string | null
          spiritual_message?: string | null
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
      is_service_role: { Args: never; Returns: boolean }
      record_credit_usage: {
        Args: { p_amount: number; p_description?: string; p_user_id: string }
        Returns: string
      }
    }
    Enums: {
      chat_visibility: "private" | "public" | "unlisted"
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
      chat_visibility: ["private", "public", "unlisted"],
    },
  },
} as const
