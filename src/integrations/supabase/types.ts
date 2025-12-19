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
          role: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          user_id?: string | null
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
      generated_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_public: boolean
          likes_count: number
          prompt: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_public?: boolean
          likes_count?: number
          prompt: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_public?: boolean
          likes_count?: number
          prompt?: string
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
      light_acknowledgements: {
        Row: {
          acknowledgement_type: string
          camly_coins: number
          created_at: string
          id: string
          is_public: boolean
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
      shared_light_moments: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
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
