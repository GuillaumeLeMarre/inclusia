"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { buildProfileSystemPromptPreview } from "@/services/profiles/profile-prompt-builder.service";
import type { PedagogicalDimensions } from "@/types/pedagogical-dimensions";

const READONLY_TEXTAREA =
  "flex min-h-[280px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700";

interface ProfileSystemPromptPreviewProps {
  name: string;
  dimensions: PedagogicalDimensions;
}

export function ProfileSystemPromptPreview({ name, dimensions }: ProfileSystemPromptPreviewProps) {
  const systemPrompt = useMemo(
    () =>
      buildProfileSystemPromptPreview({
        name,
        dimensions,
      }),
    [name, dimensions],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt système</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-slate-500">
          Stratégie pédagogique injectée dans le prompt système (partie spécifique au profil).
          Un prompt générique Inclusia est ajouté automatiquement lors de l&apos;adaptation.
        </p>
        <Label htmlFor="system-prompt-preview" className="sr-only">
          Aperçu du prompt système
        </Label>
        <textarea
          id="system-prompt-preview"
          readOnly
          className={READONLY_TEXTAREA}
          value={systemPrompt}
          aria-readonly="true"
        />
        <p className="text-xs text-slate-400">{systemPrompt.length} caractères</p>
      </CardContent>
    </Card>
  );
}
