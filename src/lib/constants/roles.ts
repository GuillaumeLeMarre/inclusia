export const USER_ROLES = ["teacher", "school_admin", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  teacher: "Enseignant",
  school_admin: "Administration scolaire",
  admin: "Administrateur",
};
