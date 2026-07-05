import {
  EMPTY_PEDAGOGICAL_DIMENSIONS,
  EMPTY_TEACHER_DIMENSIONS,
  PROFILE_DIMENSION_SECTIONS,
  type PedagogicalDimensions,
  type SystemDimensionColumn,
  type TeacherCustomDimensions,
  type TeacherDimensionColumn,
} from "@/types/pedagogical-dimensions";

export function emptySystemDimensionValues(): Record<SystemDimensionColumn, string[]> {
  return { ...EMPTY_PEDAGOGICAL_DIMENSIONS };
}

export function emptyTeacherDimensionValues(): Record<TeacherDimensionColumn, string[]> {
  return { ...EMPTY_TEACHER_DIMENSIONS };
}

export function systemDimensionsFromProfile(
  profile: Partial<PedagogicalDimensions>,
): Record<SystemDimensionColumn, string[]> {
  const base = emptySystemDimensionValues();
  for (const section of PROFILE_DIMENSION_SECTIONS) {
    base[section.systemColumn] = profile[section.systemColumn] ?? [];
  }
  return base;
}

export function teacherDimensionsFromProfile(
  profile: Partial<TeacherCustomDimensions>,
): Record<TeacherDimensionColumn, string[]> {
  const base = emptyTeacherDimensionValues();
  for (const section of PROFILE_DIMENSION_SECTIONS) {
    base[section.teacherColumn] = profile[section.teacherColumn] ?? [];
  }
  return base;
}

export { EMPTY_PEDAGOGICAL_DIMENSIONS, EMPTY_TEACHER_DIMENSIONS };
