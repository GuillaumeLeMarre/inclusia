import type {
  DashboardStats,
  Document,
  RecentActivity,
  Student,
} from "@/types";

const DEMO_STUDENTS: Student[] = [
  {
    id: "demo-1",
    teacher_id: "demo",
    school_id: null,
    first_name: "Léa",
    last_name: "Martin",
    class_name: "CM2-A",
    grade_level: "CM2",
    profiles: ["dyslexie", "tdah"],
    needs: "Besoin de textes simplifiés et de plus de visuels",
    notes: null,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    teacher_id: "demo",
    school_id: null,
    first_name: "Noah",
    last_name: "Dupont",
    class_name: "CM2-A",
    grade_level: "CM2",
    profiles: ["tsa"],
    needs: "Consignes courtes et prévisibles",
    notes: null,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    teacher_id: "demo",
    school_id: null,
    first_name: "Emma",
    last_name: "Bernard",
    class_name: "CM2-B",
    grade_level: "CM2",
    profiles: ["allophone"],
    needs: "Vocabulaire simplifié avec traductions",
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
    title: "Adaptation pour Léa Martin",
    description: "La Révolution française — Profil dyslexie",
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
    type: "student",
    title: "Élève créé",
    description: "Emma Bernard — CM2-B",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function getDemoStats(): DashboardStats {
  return {
    studentsCount: DEMO_STUDENTS.length,
    adaptationsCount: 7,
    documentsCount: DEMO_DOCUMENTS.length,
    estimatedTimeSavedMinutes: 145,
  };
}

export function getDemoStudents(): Student[] {
  return DEMO_STUDENTS;
}

export function getDemoDocuments(): Document[] {
  return DEMO_DOCUMENTS;
}

export function getDemoActivity(): RecentActivity[] {
  return DEMO_ACTIVITY;
}
