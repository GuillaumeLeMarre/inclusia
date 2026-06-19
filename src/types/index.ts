export type UserRole = "teacher" | "school_admin" | "admin";

export type DocumentStatus = "pending" | "processing" | "ready" | "error";
export type AdaptationStatus = "pending" | "processing" | "completed" | "error" | "demo";
export type DocumentFormat = "pdf" | "docx" | "txt";

export type { AdaptationLevel } from "@/types/adaptation-level";

export interface School {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  school_id: string | null;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearnerProfile {
  id: string;
  teacher_id: string;
  school_id: string | null;
  profile_name: string;
  approximate_level: string | null;
  adaptation_slugs: string[];
  pedagogical_needs: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** @deprecated Use LearnerProfile */
export type Student = LearnerProfile;

export interface LearningPreferences {
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
  metadata: Record<string, unknown>;
  updated_at: string;
}

export interface Document {
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
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Adaptation {
  id: string;
  teacher_id: string;
  profile_id: string;
  document_id: string;
  profile_slugs: string[];
  status: AdaptationStatus;
  adaptation_level: import("@/types/adaptation-level").AdaptationLevel;
  falc_score: number | null;
  falc_content: string | null;
  generate_pictograms: boolean;
  falc_pictograms: import("@/types/falc").FalcPictogramsData | null;
  adapted_content: string | null;
  summary: string | null;
  memory_sheet: string | null;
  quiz: QuizData | null;
  keywords: KeywordItem[] | null;
  simplified_questions: string[] | null;
  adapted_instructions: string | null;
  mindmap: MindmapData | null;
  mindmap_mermaid: string | null;
  audio_script: string | null;
  processing_time_ms: number | null;
  is_demo: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface KeywordItem {
  term: string;
  definition: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  type?: "concept" | "event" | "person" | "default";
}

export interface MindmapLink {
  source: string;
  target: string;
  label?: string;
}

export interface MindmapData {
  nodes: MindmapNode[];
  links: MindmapLink[];
}

export interface Feedback {
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
}

export interface AdaptationProfile {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  settings: Record<string, unknown>;
  sort_order: number;
}

export interface DashboardStats {
  profilesCount: number;
  adaptationsCount: number;
  documentsCount: number;
  estimatedTimeSavedMinutes: number;
}

export interface RecentActivity {
  id: string;
  type: "adaptation" | "document" | "profile";
  title: string;
  description: string;
  created_at: string;
}
