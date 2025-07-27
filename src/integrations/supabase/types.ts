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
      application_notes: {
        Row: {
          application_id: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          note_type: string | null
          role: string | null
        }
        Insert: {
          application_id?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          note_type?: string | null
          role?: string | null
        }
        Update: {
          application_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          note_type?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          assigned_ekspert_id: string | null
          bashkia_id: string
          created_at: string | null
          dokumente: Json | null
          fusha_id: string
          grupmosha: string
          id: string
          pershkrimi: string
          prototip_url: string | null
          status_id: string
          titulli: string
          user_id: string
        }
        Insert: {
          assigned_ekspert_id?: string | null
          bashkia_id: string
          created_at?: string | null
          dokumente?: Json | null
          fusha_id: string
          grupmosha: string
          id?: string
          pershkrimi: string
          prototip_url?: string | null
          status_id: string
          titulli: string
          user_id: string
        }
        Update: {
          assigned_ekspert_id?: string | null
          bashkia_id?: string
          created_at?: string | null
          dokumente?: Json | null
          fusha_id?: string
          grupmosha?: string
          id?: string
          pershkrimi?: string
          prototip_url?: string | null
          status_id?: string
          titulli?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_bashkia_id_fkey"
            columns: ["bashkia_id"]
            isOneToOne: false
            referencedRelation: "bashkia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_fusha_id_fkey"
            columns: ["fusha_id"]
            isOneToOne: false
            referencedRelation: "fusha"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status"
            referencedColumns: ["id"]
          },
        ]
      }
      bashkia: {
        Row: {
          id: string
          label: string
        }
        Insert: {
          id?: string
          label: string
        }
        Update: {
          id?: string
          label?: string
        }
        Relationships: []
      }
      fusha: {
        Row: {
          id: string
          label: string
        }
        Insert: {
          id?: string
          label: string
        }
        Update: {
          id?: string
          label?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          emri: string
          id: string
          mbiemri: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          emri: string
          id: string
          mbiemri: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          emri?: string
          id?: string
          mbiemri?: string
          role?: string | null
        }
        Relationships: []
      }
      status: {
        Row: {
          color_badge: string | null
          id: string
          label: string
        }
        Insert: {
          color_badge?: string | null
          id?: string
          label: string
        }
        Update: {
          color_badge?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      status_history: {
        Row: {
          application_id: string | null
          changed_at: string | null
          changed_by: string | null
          comment: string | null
          id: string
          status_id: string
        }
        Insert: {
          application_id?: string | null
          changed_at?: string | null
          changed_by?: string | null
          comment?: string | null
          id?: string
          status_id: string
        }
        Update: {
          application_id?: string | null
          changed_at?: string | null
          changed_by?: string | null
          comment?: string | null
          id?: string
          status_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_history_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      latest_ekspert_note_per_application: {
        Row: {
          application_id: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string | null
          note_type: string | null
          role: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
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
