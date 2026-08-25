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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          address_line: string | null
          category: string
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_hiring: boolean
          is_verified: boolean
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          province_state: string | null
          search_vector: unknown
          services: string[]
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address_line?: string | null
          category: string
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_hiring?: boolean
          is_verified?: boolean
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          province_state?: string | null
          search_vector?: unknown
          services?: string[]
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address_line?: string | null
          category?: string
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_hiring?: boolean
          is_verified?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          province_state?: string | null
          search_vector?: unknown
          services?: string[]
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          profile_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          profile_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_profile_id_fkey"
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
          created_by: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address_line: string | null
          business_id: string | null
          capacity: number | null
          city: string | null
          country: string | null
          created_at: string
          creator_id: string
          description: string | null
          ends_at: string | null
          id: string
          is_online: boolean
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          online_url: string | null
          organization_id: string | null
          province_state: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["entity_status"]
          summary: string | null
          title: string
          updated_at: string
          venue_name: string | null
        }
        Insert: {
          address_line?: string | null
          business_id?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_online?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          online_url?: string | null
          organization_id?: string | null
          province_state?: string | null
          slug: string
          starts_at: string
          status?: Database["public"]["Enums"]["entity_status"]
          summary?: string | null
          title: string
          updated_at?: string
          venue_name?: string | null
        }
        Update: {
          address_line?: string | null
          business_id?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_online?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          online_url?: string | null
          organization_id?: string | null
          province_state?: string | null
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["entity_status"]
          summary?: string | null
          title?: string
          updated_at?: string
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
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
      notifications: {
        Row: {
          actor_id: string | null
          connection_id: string | null
          content_id: string | null
          content_note: string | null
          content_slug: string | null
          content_title: string | null
          content_type: string | null
          conversation_id: string | null
          created_at: string
          id: string
          message_id: string | null
          read_at: string | null
          recipient_id: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          connection_id?: string | null
          content_id?: string | null
          content_note?: string | null
          content_slug?: string | null
          content_title?: string | null
          content_type?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          read_at?: string | null
          recipient_id: string
          type: string
        }
        Update: {
          actor_id?: string | null
          connection_id?: string | null
          content_id?: string | null
          content_note?: string | null
          content_slug?: string | null
          content_title?: string | null
          content_type?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          read_at?: string | null
          recipient_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          author_id: string
          business_id: string | null
          city: string | null
          contact_email: string | null
          country: string | null
          created_at: string
          deadline: string | null
          description: string
          external_url: string | null
          id: string
          is_remote: boolean
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          organization_id: string | null
          province_state: string | null
          search_vector: unknown
          slug: string
          status: Database["public"]["Enums"]["opportunity_status"]
          summary: string | null
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at: string
        }
        Insert: {
          author_id: string
          business_id?: string | null
          city?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          external_url?: string | null
          id?: string
          is_remote?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          organization_id?: string | null
          province_state?: string | null
          search_vector?: unknown
          slug: string
          status?: Database["public"]["Enums"]["opportunity_status"]
          summary?: string | null
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at?: string
        }
        Update: {
          author_id?: string
          business_id?: string | null
          city?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          external_url?: string | null
          id?: string
          is_remote?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          organization_id?: string | null
          province_state?: string | null
          search_vector?: unknown
          slug?: string
          status?: Database["public"]["Enums"]["opportunity_status"]
          summary?: string | null
          title?: string
          type?: Database["public"]["Enums"]["opportunity_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_line: string | null
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_accepting_volunteers: boolean
          is_verified: boolean
          logo_url: string | null
          mission: string | null
          name: string
          organization_type: string | null
          owner_id: string
          phone: string | null
          programs: string[]
          province_state: string | null
          search_vector: unknown
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_accepting_volunteers?: boolean
          is_verified?: boolean
          logo_url?: string | null
          mission?: string | null
          name: string
          organization_type?: string | null
          owner_id: string
          phone?: string | null
          programs?: string[]
          province_state?: string | null
          search_vector?: unknown
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address_line?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_accepting_volunteers?: boolean
          is_verified?: boolean
          logo_url?: string | null
          mission?: string | null
          name?: string
          organization_type?: string | null
          owner_id?: string
          phone?: string | null
          programs?: string[]
          province_state?: string | null
          search_vector?: unknown
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string | null
          first_name: string | null
          headline: string | null
          id: string
          is_public: boolean
          languages: string[]
          last_name: string | null
          linkedin_url: string | null
          onboarding_completed: boolean
          opportunity_status: Database["public"]["Enums"]["profile_status"]
          profession: string | null
          province_state: string | null
          role: Database["public"]["Enums"]["user_role"]
          search_vector: unknown
          skills: string[]
          updated_at: string
          username: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          headline?: string | null
          id: string
          is_public?: boolean
          languages?: string[]
          last_name?: string | null
          linkedin_url?: string | null
          onboarding_completed?: boolean
          opportunity_status?: Database["public"]["Enums"]["profile_status"]
          profession?: string | null
          province_state?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          search_vector?: unknown
          skills?: string[]
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          headline?: string | null
          id?: string
          is_public?: boolean
          languages?: string[]
          last_name?: string | null
          linkedin_url?: string | null
          onboarding_completed?: boolean
          opportunity_status?: Database["public"]["Enums"]["profile_status"]
          profession?: string | null
          province_state?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          search_vector?: unknown
          skills?: string[]
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      saved_opportunities: {
        Row: {
          created_at: string
          opportunity_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          opportunity_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          opportunity_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_opportunities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_moderate: { Args: never; Returns: boolean }
      get_message_inbox: {
        Args: never
        Returns: {
          conversation_id: string
          conversation_updated_at: string
          latest_message_body: string | null
          latest_message_created_at: string | null
          latest_message_sender_id: string | null
          other_member_id: string | null
          unread_count: number
        }[]
      }
      get_unread_message_counts: {
        Args: never
        Returns: {
          conversation_id: string
          unread_count: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_conversation_member: {
        Args: { target_conversation_id: string }
        Returns: boolean
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_conversation_read: {
        Args: {
          read_through_message_id: string
          target_conversation_id: string
        }
        Returns: boolean
      }
      mark_notification_read: {
        Args: { target_notification_id: string }
        Returns: boolean
      }
      moderate_event: {
        Args: {
          target_decision: string
          target_event_id: string
          target_note: string | null
        }
        Returns: boolean
      }
      moderate_opportunity: {
        Args: {
          target_decision: string
          target_note: string | null
          target_opportunity_id: string
        }
        Returns: boolean
      }
      respond_connection_request: {
        Args: { target_connection_id: string; target_decision: string }
        Returns: boolean
      }
      search_afghan_hub: {
        Args: { result_limit?: number; search_query: string }
        Returns: {
          city: string
          country: string
          entity_id: string
          entity_slug: string
          entity_type: string
          image_url: string
          rank: number
          subtitle: string
          title: string
        }[]
      }
      start_direct_conversation: {
        Args: { target_member_id: string }
        Returns: string
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      connection_status: "pending" | "accepted" | "declined" | "blocked"
      entity_status: "draft" | "published" | "suspended"
      opportunity_status: "draft" | "published" | "closed" | "expired"
      opportunity_type:
        | "job"
        | "volunteer"
        | "scholarship"
        | "mentorship"
        | "investment"
        | "housing"
        | "event"
        | "education"
      profile_status:
        | "available"
        | "looking_for_work"
        | "hiring"
        | "mentoring"
        | "open_to_collaboration"
        | "not_available"
      user_role: "member" | "moderator" | "admin"
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
      connection_status: ["pending", "accepted", "declined", "blocked"],
      entity_status: ["draft", "published", "suspended"],
      opportunity_status: ["draft", "published", "closed", "expired"],
      opportunity_type: [
        "job",
        "volunteer",
        "scholarship",
        "mentorship",
        "investment",
        "housing",
        "event",
        "education",
      ],
      profile_status: [
        "available",
        "looking_for_work",
        "hiring",
        "mentoring",
        "open_to_collaboration",
        "not_available",
      ],
      user_role: ["member", "moderator", "admin"],
    },
  },
} as const
