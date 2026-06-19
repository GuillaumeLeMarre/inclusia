export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "teacher" | "school_admin" | "admin";
export type DocumentStatus = "pending" | "processing" | "ready" | "error";
export type AdaptationStatus = "pending" | "processing" | "completed" | "error" | "demo";
export type DocumentFormat = "pdf" | "docx" | "txt";

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          city: string | null;
          country: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          city?: string | null;
          country?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["schools"]["Insert"]>;
        Relationships: [];
      };
      teachers: {
        Row: {
          id: string;
          school_id: string | null;
          role: UserRole;
          first_name: string;
          last_name: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          school_id?: string | null;
          role?: UserRole;
          first_name: string;
          last_name: string;
          email: string;
          avatar_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["teachers"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "teachers_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      learner_profiles: {
        Row: {
          id: string;
          teacher_id: string;
          school_id: string | null;
          profile_name: string;
          approximate_level: string | null;
          adaptation_slugs: Json;
          pedagogical_needs: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          school_id?: string | null;
          profile_name: string;
          approximate_level?: string | null;
          adaptation_slugs?: Json;
          pedagogical_needs?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["learner_profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "students_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_preferences: {
        Row: {
          id: string;
          profile_id: string;
          audio_enabled: boolean;
          diagrams_enabled: boolean;
          quiz_enabled: boolean;
          simplified_vocab: boolean;
          adapted_font: boolean;
          simplified_text: boolean;
          difficulty_level: number;
          preferred_format: string;
          metadata: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          audio_enabled?: boolean;
          diagrams_enabled?: boolean;
          quiz_enabled?: boolean;
          simplified_vocab?: boolean;
          adapted_font?: boolean;
          simplified_text?: boolean;
          difficulty_level?: number;
          preferred_format?: string;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["learning_preferences"]["Insert"]>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          file_name: string;
          file_type: DocumentFormat;
          file_size: number;
          storage_path: string;
          extracted_text: string | null;
          page_count: number | null;
          status: DocumentStatus;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          title: string;
          file_name: string;
          file_type: DocumentFormat;
          file_size?: number;
          storage_path: string;
          extracted_text?: string | null;
          page_count?: number | null;
          status?: DocumentStatus;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
        Relationships: [];
      };
      adaptations: {
        Row: {
          id: string;
          teacher_id: string;
          profile_id: string;
          document_id: string;
          profile_slugs: Json;
          status: AdaptationStatus;
          adapted_content: string | null;
          summary: string | null;
          memory_sheet: string | null;
          quiz: Json | null;
          keywords: Json | null;
          simplified_questions: Json | null;
          adapted_instructions: string | null;
          mindmap: Json | null;
          audio_script: string | null;
          processing_time_ms: number | null;
          is_demo: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          profile_id: string;
          document_id: string;
          profile_slugs?: Json;
          status?: AdaptationStatus;
          adapted_content?: string | null;
          summary?: string | null;
          memory_sheet?: string | null;
          quiz?: Json | null;
          keywords?: Json | null;
          simplified_questions?: Json | null;
          adapted_instructions?: string | null;
          mindmap?: Json | null;
          audio_script?: string | null;
          processing_time_ms?: number | null;
          is_demo?: boolean;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["adaptations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "adaptations_student_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "learner_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "adaptations_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      feedbacks: {
        Row: {
          id: string;
          adaptation_id: string;
          teacher_id: string;
          profile_id: string;
          understood: boolean | null;
          too_long: boolean | null;
          too_difficult: boolean | null;
          more_diagrams: boolean | null;
          more_audio: boolean | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          adaptation_id: string;
          teacher_id: string;
          profile_id: string;
          understood?: boolean | null;
          too_long?: boolean | null;
          too_difficult?: boolean | null;
          more_diagrams?: boolean | null;
          more_audio?: boolean | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["feedbacks"]["Insert"]>;
        Relationships: [];
      };
      adaptation_profiles: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          category: string;
          is_active: boolean;
          settings: Json;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          category?: string;
          is_active?: boolean;
          settings?: Json;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["adaptation_profiles"]["Insert"]>;
        Relationships: [];
      };
      adaptation_prompt_templates: {
        Row: {
          id: string;
          profile_id: string | null;
          slug: string;
          name: string;
          description: string | null;
          prompt_type: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          slug: string;
          name: string;
          description?: string | null;
          prompt_type?: string;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["adaptation_prompt_templates"]["Insert"]>;
        Relationships: [];
      };
      adaptation_prompt_versions: {
        Row: {
          id: string;
          template_id: string;
          version: number;
          content: string;
          is_active: boolean;
          created_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          version: number;
          content: string;
          is_active?: boolean;
          created_by?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["adaptation_prompt_versions"]["Insert"]>;
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string;
          teacher_id: string | null;
          school_id: string | null;
          event_type: string;
          event_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id?: string | null;
          school_id?: string | null;
          event_type: string;
          event_data?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      document_status: DocumentStatus;
      adaptation_status: AdaptationStatus;
      document_format: DocumentFormat;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
