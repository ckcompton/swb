// Generated via: supabase gen types typescript --local
// Regenerate after changing supabase/migrations/*.sql (see README.md).
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          class_session_id: string
          created_at: string
          id: string
          profile_id: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          class_session_id: string
          created_at?: string
          id?: string
          profile_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          class_session_id?: string
          created_at?: string
          id?: string
          profile_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          allows_free_trial: boolean
          capacity: number
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string
          id: string
          series_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["class_session_status"]
          title: string
          trainer_id: string | null
          updated_at: string
        }
        Insert: {
          allows_free_trial?: boolean
          capacity: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at: string
          id?: string
          series_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["class_session_status"]
          title: string
          trainer_id?: string | null
          updated_at?: string
        }
        Update: {
          allows_free_trial?: boolean
          capacity?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          series_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["class_session_status"]
          title?: string
          trainer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          plan_name: string
          profile_id: string
          starts_at: string
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_name: string
          profile_id: string
          starts_at?: string
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_name?: string
          profile_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      trainers: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          photo_path: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          photo_path?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          photo_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trial_requests: {
        Row: {
          admin_notes: string | null
          class_session_id: string
          created_at: string
          email: string
          experience_level: Database["public"]["Enums"]["trial_experience_level"]
          first_name: string
          id: string
          last_name: string
          message: string | null
          phone: string
          status: Database["public"]["Enums"]["trial_request_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          class_session_id: string
          created_at?: string
          email: string
          experience_level: Database["public"]["Enums"]["trial_experience_level"]
          first_name: string
          id?: string
          last_name: string
          message?: string | null
          phone: string
          status?: Database["public"]["Enums"]["trial_request_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          class_session_id?: string
          created_at?: string
          email?: string
          experience_level?: Database["public"]["Enums"]["trial_experience_level"]
          first_name?: string
          id?: string
          last_name?: string
          message?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["trial_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_requests_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_entries: {
        Row: {
          class_session_id: string
          created_at: string
          id: string
          position: number
          profile_id: string
          status: Database["public"]["Enums"]["waitlist_status"]
          updated_at: string
        }
        Insert: {
          class_session_id: string
          created_at?: string
          id?: string
          position: number
          profile_id: string
          status?: Database["public"]["Enums"]["waitlist_status"]
          updated_at?: string
        }
        Update: {
          class_session_id?: string
          created_at?: string
          id?: string
          position?: number
          profile_id?: string
          status?: Database["public"]["Enums"]["waitlist_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waivers: {
        Row: {
          created_at: string
          document_url: string | null
          id: string
          profile_id: string
          provider: string
          provider_request_id: string | null
          signed_at: string | null
          status: string
          updated_at: string
          waiver_version: string
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          id?: string
          profile_id: string
          provider?: string
          provider_request_id?: string | null
          signed_at?: string | null
          status?: string
          updated_at?: string
          waiver_version: string
        }
        Update: {
          created_at?: string
          document_url?: string | null
          id?: string
          profile_id?: string
          provider?: string
          provider_request_id?: string | null
          signed_at?: string | null
          status?: string
          updated_at?: string
          waiver_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "waivers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      class_session_booked_counts: {
        Row: {
          booked_count: number | null
          class_session_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      class_session_waitlist_counts: {
        Row: {
          class_session_id: string | null
          waitlist_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      book_class_session: {
        Args: { p_class_session_id: string }
        Returns: {
          class_session_id: string
          created_at: string
          id: string
          profile_id: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_booking: {
        Args: { p_booking_id: string }
        Returns: {
          class_session_id: string
          created_at: string
          id: string
          profile_id: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_recent_trial_request: {
        Args: {
          p_class_session_id: string
          p_email: string
          p_window_minutes: number
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_member_eligible_for_session: {
        Args: {
          p_profile_id: string
          p_session: Database["public"]["Tables"]["class_sessions"]["Row"]
        }
        Returns: boolean
      }
      join_waitlist: {
        Args: { p_class_session_id: string }
        Returns: {
          class_session_id: string
          created_at: string
          id: string
          position: number
          profile_id: string
          status: Database["public"]["Enums"]["waitlist_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "waitlist_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      leave_waitlist: {
        Args: { p_waitlist_entry_id: string }
        Returns: {
          class_session_id: string
          created_at: string
          id: string
          position: number
          profile_id: string
          status: Database["public"]["Enums"]["waitlist_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "waitlist_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_waiver_signed: {
        Args: {
          p_document_url: string
          p_profile_id: string
          p_submission_id: string
          p_waiver_version: string
        }
        Returns: {
          created_at: string
          document_url: string | null
          id: string
          profile_id: string
          provider: string
          provider_request_id: string | null
          signed_at: string | null
          status: string
          updated_at: string
          waiver_version: string
        }
        SetofOptions: {
          from: "*"
          to: "waivers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "member"
      booking_status: "booked" | "canceled"
      class_session_status: "scheduled" | "canceled"
      membership_status: "active" | "inactive" | "expired"
      trial_experience_level: "none" | "beginner" | "intermediate" | "advanced"
      trial_request_status:
        | "pending"
        | "contacted"
        | "approved"
        | "declined"
        | "completed"
      waitlist_status: "waiting" | "promoted" | "left"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "member"],
      booking_status: ["booked", "canceled"],
      class_session_status: ["scheduled", "canceled"],
      membership_status: ["active", "inactive", "expired"],
      trial_experience_level: ["none", "beginner", "intermediate", "advanced"],
      trial_request_status: [
        "pending",
        "contacted",
        "approved",
        "declined",
        "completed",
      ],
      waitlist_status: ["waiting", "promoted", "left"],
    },
  },
} as const

