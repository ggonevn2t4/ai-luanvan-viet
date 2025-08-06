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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      chapters: {
        Row: {
          chapter_number: number
          completed_at: string | null
          content: string | null
          created_at: string | null
          id: string
          notes: string | null
          status: string | null
          target_words: number | null
          thesis_id: string
          title: string
          updated_at: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          chapter_number: number
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          target_words?: number | null
          thesis_id: string
          title: string
          updated_at?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          chapter_number?: number
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          target_words?: number | null
          thesis_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses"
            referencedColumns: ["id"]
          },
        ]
      }
      citations: {
        Row: {
          abstract: string | null
          authors: string[] | null
          citation_key: string
          created_at: string | null
          doi: string | null
          formatted_citation: string | null
          id: string
          is_used: boolean | null
          isbn: string | null
          issue: string | null
          journal_name: string | null
          keywords: string[] | null
          notes: string | null
          pages: string | null
          publication_type: string | null
          publication_year: number | null
          publisher: string | null
          thesis_id: string
          title: string
          updated_at: string | null
          url: string | null
          user_id: string
          volume: string | null
        }
        Insert: {
          abstract?: string | null
          authors?: string[] | null
          citation_key: string
          created_at?: string | null
          doi?: string | null
          formatted_citation?: string | null
          id?: string
          is_used?: boolean | null
          isbn?: string | null
          issue?: string | null
          journal_name?: string | null
          keywords?: string[] | null
          notes?: string | null
          pages?: string | null
          publication_type?: string | null
          publication_year?: number | null
          publisher?: string | null
          thesis_id: string
          title: string
          updated_at?: string | null
          url?: string | null
          user_id: string
          volume?: string | null
        }
        Update: {
          abstract?: string | null
          authors?: string[] | null
          citation_key?: string
          created_at?: string | null
          doi?: string | null
          formatted_citation?: string | null
          id?: string
          is_used?: boolean | null
          isbn?: string | null
          issue?: string | null
          journal_name?: string | null
          keywords?: string[] | null
          notes?: string | null
          pages?: string | null
          publication_type?: string | null
          publication_year?: number | null
          publisher?: string | null
          thesis_id?: string
          title?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string
          volume?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citations_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborators: {
        Row: {
          accepted_at: string | null
          collaborator_email: string
          collaborator_name: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          notes: string | null
          owner_id: string
          permissions: string[] | null
          role: string | null
          status: string | null
          thesis_id: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          collaborator_email: string
          collaborator_name?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          notes?: string | null
          owner_id: string
          permissions?: string[] | null
          role?: string | null
          status?: string | null
          thesis_id: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          collaborator_email?: string
          collaborator_name?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          notes?: string | null
          owner_id?: string
          permissions?: string[] | null
          role?: string | null
          status?: string | null
          thesis_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses"
            referencedColumns: ["id"]
          },
        ]
      }
      export_logs: {
        Row: {
          created_at: string | null
          download_count: number | null
          error_message: string | null
          expires_at: string | null
          export_duration: number | null
          export_format: string
          export_options: Json | null
          file_size: number | null
          id: string
          status: string | null
          thesis_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          download_count?: number | null
          error_message?: string | null
          expires_at?: string | null
          export_duration?: number | null
          export_format: string
          export_options?: Json | null
          file_size?: number | null
          id?: string
          status?: string | null
          thesis_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          download_count?: number | null
          error_message?: string | null
          expires_at?: string | null
          export_duration?: number | null
          export_format?: string
          export_options?: Json | null
          file_size?: number | null
          id?: string
          status?: string | null
          thesis_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_logs_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      theses: {
        Row: {
          citation_format: string | null
          completion_date: string | null
          content: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          is_active: boolean | null
          pages_target: number | null
          progress_percentage: number | null
          research_method: string | null
          status: string | null
          subject: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          citation_format?: string | null
          completion_date?: string | null
          content?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          pages_target?: number | null
          progress_percentage?: number | null
          research_method?: string | null
          status?: string | null
          subject?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          citation_format?: string | null
          completion_date?: string | null
          content?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          pages_target?: number | null
          progress_percentage?: number | null
          research_method?: string | null
          status?: string | null
          subject?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      thesis_versions: {
        Row: {
          changes_summary: string | null
          content: string
          created_at: string | null
          id: string
          is_current: boolean | null
          thesis_id: string
          title: string
          user_id: string
          version_number: number
          word_count: number | null
        }
        Insert: {
          changes_summary?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_current?: boolean | null
          thesis_id: string
          title: string
          user_id: string
          version_number: number
          word_count?: number | null
        }
        Update: {
          changes_summary?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_current?: boolean | null
          thesis_id?: string
          title?: string
          user_id?: string
          version_number?: number
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "thesis_versions_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_thesis_progress: {
        Args: { thesis_id_param: string }
        Returns: number
      }
      create_default_chapters: {
        Args: { thesis_id_param: string; user_id_param: string }
        Returns: undefined
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
