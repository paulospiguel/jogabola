export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      event_attendance: {
        Row: {
          event_id: number
          id: number
          response_time: string | null
          status: string
          user_id: number
        }
        Insert: {
          event_id: number
          id?: number
          response_time?: string | null
          status: string
          user_id: number
        }
        Update: {
          event_id?: number
          id?: number
          response_time?: string | null
          status?: string
          user_id?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          id: number
          opponent_team_id: number | null
          start_time: string
          team_id: number
          title: string
          type: string
          venue_id: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: number
          opponent_team_id?: number | null
          start_time: string
          team_id: number
          title: string
          type: string
          venue_id?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: number
          opponent_team_id?: number | null
          start_time?: string
          team_id?: number
          title?: string
          type?: string
          venue_id?: number | null
        }
        Relationships: []
      }
      match_results: {
        Row: {
          away_score: number | null
          event_id: number
          home_score: number | null
          id: number
          status: string | null
        }
        Insert: {
          away_score?: number | null
          event_id: number
          home_score?: number | null
          id?: number
          status?: string | null
        }
        Update: {
          away_score?: number | null
          event_id?: number
          home_score?: number | null
          id?: number
          status?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: number
          is_read: boolean | null
          recipient_id: number | null
          sender_id: number
          team_id: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          recipient_id?: number | null
          sender_id: number
          team_id?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          recipient_id?: number | null
          sender_id?: number
          team_id?: number | null
        }
        Relationships: []
      }
      player_profiles: {
        Row: {
          bio: string | null
          date_of_birth: string | null
          height: number | null
          id: number
          is_active: boolean | null
          number: number | null
          position: string | null
          preferred_foot: string | null
          skills: Json | null
          user_id: number
          weight: number | null
        }
        Insert: {
          bio?: string | null
          date_of_birth?: string | null
          height?: number | null
          id?: number
          is_active?: boolean | null
          number?: number | null
          position?: string | null
          preferred_foot?: string | null
          skills?: Json | null
          user_id: number
          weight?: number | null
        }
        Update: {
          bio?: string | null
          date_of_birth?: string | null
          height?: number | null
          id?: number
          is_active?: boolean | null
          number?: number | null
          position?: string | null
          preferred_foot?: string | null
          skills?: Json | null
          user_id?: number
          weight?: number | null
        }
        Relationships: []
      }
      polls: {
        Row: {
          created_at: string | null
          created_by: number
          description: string | null
          expires_at: string | null
          id: number
          options: Json
          team_id: number
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by: number
          description?: string | null
          expires_at?: string | null
          id?: number
          options: Json
          team_id: number
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: number
          description?: string | null
          expires_at?: string | null
          id?: number
          options?: Json
          team_id?: number
          title?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: number
          is_starter: boolean | null
          joined_at: string | null
          team_id: number
          user_id: number
        }
        Insert: {
          id?: number
          is_starter?: boolean | null
          joined_at?: string | null
          team_id: number
          user_id: number
        }
        Update: {
          id?: number
          is_starter?: boolean | null
          joined_at?: string | null
          team_id?: number
          user_id?: number
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string | null
          id: number
          location: string | null
          logo_url: string | null
          manager_id: number
          name: string
          short_name: string
          team_size: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          location?: string | null
          logo_url?: string | null
          manager_id: number
          name: string
          short_name: string
          team_size: number
        }
        Update: {
          created_at?: string | null
          id?: number
          location?: string | null
          logo_url?: string | null
          manager_id?: number
          name?: string
          short_name?: string
          team_size?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_id: string | null
          auth_provider: string | null
          avatar: string | null
          created_at: string | null
          email: string
          full_name: string
          id: number
          is_onboarded: boolean | null
          language: string | null
          password: string | null
          user_type: string | null
          username: string
        }
        Insert: {
          auth_id?: string | null
          auth_provider?: string | null
          avatar?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: number
          is_onboarded?: boolean | null
          language?: string | null
          password?: string | null
          user_type?: string | null
          username: string
        }
        Update: {
          auth_id?: string | null
          auth_provider?: string | null
          avatar?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: number
          is_onboarded?: boolean | null
          language?: string | null
          password?: string | null
          user_type?: string | null
          username?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string
          contact_info: string | null
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          price_per_hour: number | null
        }
        Insert: {
          address: string
          contact_info?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name: string
          price_per_hour?: number | null
        }
        Update: {
          address?: string
          contact_info?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name?: string
          price_per_hour?: number | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          id: number
          option_index: number
          poll_id: number
          user_id: number
          voted_at: string | null
        }
        Insert: {
          id?: number
          option_index: number
          poll_id: number
          user_id: number
          voted_at?: string | null
        }
        Update: {
          id?: number
          option_index?: number
          poll_id?: number
          user_id?: number
          voted_at?: string | null
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          conditions: string | null
          event_id: number
          fetched_at: string | null
          id: number
          precipitation: number | null
          temperature: number | null
          wind_speed: number | null
        }
        Insert: {
          conditions?: string | null
          event_id: number
          fetched_at?: string | null
          id?: number
          precipitation?: number | null
          temperature?: number | null
          wind_speed?: number | null
        }
        Update: {
          conditions?: string | null
          event_id?: number
          fetched_at?: string | null
          id?: number
          precipitation?: number | null
          temperature?: number | null
          wind_speed?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
