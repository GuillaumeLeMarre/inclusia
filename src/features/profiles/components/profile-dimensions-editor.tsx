"use client";

import { ProfileRuleListEditor } from "@/features/profiles/components/profile-rule-list-editor";
import { PROFILE_DIMENSION_SECTIONS } from "@/types/pedagogical-dimensions";
import { PEDAGOGICAL_OBJECTIVE_SUGGESTIONS } from "@/types/pedagogical-objective-suggestions";

type DimensionMode = "system" | "teacher";

interface ProfileDimensionsEditorProps {
  mode: DimensionMode;
  values: Record<string, string[]>;
  previousValues?: Record<string, string[]>;
  onChange: (column: string, rules: string[]) => void;
}

export function ProfileDimensionsEditor({
  mode,
  values,
  previousValues,
  onChange,
}: ProfileDimensionsEditorProps) {
  return (
    <div className="w-full space-y-4 overflow-x-hidden">
      {PROFILE_DIMENSION_SECTIONS.map((section) => {
        const column = mode === "system" ? section.systemColumn : section.teacherColumn;
        return (
          <ProfileRuleListEditor
            key={column}
            title={section.title}
            description={
              mode === "teacher"
                ? `${section.description} Ces règles complètent le profil système de référence.`
                : section.description
            }
            placeholder={section.placeholder}
            value={values[column] ?? []}
            previousValue={previousValues?.[column]}
            suggestions={section.id === "objectives" ? PEDAGOGICAL_OBJECTIVE_SUGGESTIONS : undefined}
            onChange={(rules) => onChange(column, rules)}
          />
        );
      })}
    </div>
  );
}
