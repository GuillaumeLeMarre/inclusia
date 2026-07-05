"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { buildTeacherProfileSystemPromptPreview } from "@/services/profiles/profile-prompt-builder.service";
import { systemDimensionsFromProfile } from "@/lib/profiles/dimension-form-helpers";
import type { PedagogicalProfile } from "@/types/pedagogical-profile";
import type { TeacherCustomDimensions } from "@/types/pedagogical-dimensions";

const READONLY_TEXTAREA =
  "flex min-h-[280px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700";

interface TeacherProfileSystemPromptPreviewProps {
  name: string;
  sourceProfile?: PedagogicalProfile;
  teacherDimensions: TeacherCustomDimensions;
}

export function TeacherProfileSystemPromptPreview({
  name,
  sourceProfile,
  teacherDimensions,
}: TeacherProfileSystemPromptPreviewProps) {
  const systemPrompt = useMemo(() => {
    if (!sourceProfile) {
      return "Sélectionnez un profil système source pour prévisualiser le prompt.";
    }
    return buildTeacherProfileSystemPromptPreview({
      name,
      sourceDimensions: systemDimensionsFromProfile(sourceProfile),
      teacherDimensions,
    });
  }, [name, sourceProfile, teacherDimensions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt système</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-slate-500">
          Fusion du profil système source et de vos règles (partie spécifique au profil).
          Un prompt générique Inclusia est ajouté automatiquement lors de l&apos;adaptation.
        </p>
        <Label htmlFor="teacher-system-prompt-preview" className="sr-only">
          Aperçu du prompt système
        </Label>
        <textarea
          id="teacher-system-prompt-preview"
          readOnly
          className={READONLY_TEXTAREA}
          value={systemPrompt}
          aria-readonly="true"
        />
        {sourceProfile && (
          <p className="text-xs text-slate-400">{systemPrompt.length} caractères</p>
        )}
      </CardContent>
    </Card>
  );
}
