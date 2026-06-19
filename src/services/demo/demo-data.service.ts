import type {
  DashboardStats,
  Document,
  RecentActivity,
  LearnerProfile,
} from "@/types";

const DEMO_PROFILES: LearnerProfile[] = [
  {
    id: "demo-1",
    teacher_id: "demo",
    school_id: null,
    profile_name: "CM2 — lecture simplifiée",
    approximate_level: "CM2",
    adaptation_slugs: ["dyslexie", "tdah"],
    pedagogical_needs: "Textes simplifiés et plus de visuels",
    notes: null,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    teacher_id: "demo",
    school_id: null,
    profile_name: "Cycle 3 — consignes courtes",
    approximate_level: "CM1-CM2",
    adaptation_slugs: ["tsa"],
    pedagogical_needs: "Consignes courtes et prévisibles",
    notes: null,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    teacher_id: "demo",
    school_id: null,
    profile_name: "6e — vocabulaire allophone",
    approximate_level: "6e",
    adaptation_slugs: ["allophone"],
    pedagogical_needs: "Vocabulaire simplifié avec traductions",
    notes: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEMO_DOCUMENTS: Document[] = [
  {
    id: "doc-1",
    teacher_id: "demo",
    title: "La Révolution française",
    file_name: "revolution-francaise.pdf",
    file_type: "pdf",
    file_size: 2457600,
    storage_path: "demo/revolution-francaise.pdf",
    extracted_text: null,
    page_count: 12,
    status: "ready",
    metadata: {},
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "doc-2",
    teacher_id: "demo",
    title: "Les fractions - Mathématiques",
    file_name: "fractions-maths.docx",
    file_type: "docx",
    file_size: 512000,
    storage_path: "demo/fractions-maths.docx",
    extracted_text: null,
    page_count: 4,
    status: "ready",
    metadata: {},
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEMO_ACTIVITY: RecentActivity[] = [
  {
    id: "act-1",
    type: "adaptation",
    title: "Adaptation — CM2 — lecture simplifiée",
    description: "La Révolution française — Dyslexie",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "act-2",
    type: "document",
    title: "Document importé",
    description: "Les fractions - Mathématiques.docx",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "act-3",
    type: "profile",
    title: "Profil créé",
    description: "6e — vocabulaire allophone",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function getDemoStats(): DashboardStats {
  return {
    profilesCount: DEMO_PROFILES.length,
    adaptationsCount: 7,
    documentsCount: DEMO_DOCUMENTS.length,
    estimatedTimeSavedMinutes: 145,
  };
}

export function getDemoProfiles(): LearnerProfile[] {
  return DEMO_PROFILES;
}

/** @deprecated Use getDemoProfiles */
export const getDemoStudents = getDemoProfiles;

export function getDemoDocuments(): Document[] {
  return DEMO_DOCUMENTS;
}

export function getDemoActivity(): RecentActivity[] {
  return DEMO_ACTIVITY;
}
