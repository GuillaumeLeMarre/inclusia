"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileDimensionsEditor } from "@/features/profiles/components/profile-dimensions-editor";
import { TeacherProfileSystemPromptPreview } from "@/features/profiles/components/teacher-profile-system-prompt-preview";
import type { PedagogicalProfile, TeacherProfile } from "@/types/pedagogical-profile";
import { DEFAULT_PROFILE_OPTIONS } from "@/types/pedagogical-profile";
import {
  emptyTeacherDimensionValues,
  teacherDimensionsFromProfile,
} from "@/lib/profiles/dimension-form-helpers";

const TEXTAREA =
  "flex min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const TAB_BTN =
  "min-h-[44px] shrink-0 rounded-lg border px-3 py-2 text-sm transition-colors";

type TeacherTab = "general" | "dimensions";

const TABS: { id: TeacherTab; label: string }[] = [
  { id: "general", label: "Général" },
  { id: "dimensions", label: "Règles pédagogiques" },
];

interface TeacherProfileEditorProps {
  systemProfiles: PedagogicalProfile[];
  initial?: TeacherProfile;
}

export function TeacherProfileEditor({ systemProfiles, initial }: TeacherProfileEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TeacherTab>("general");
  const [dimensions, setDimensions] = useState(() =>
    initial ? teacherDimensionsFromProfile(initial) : emptyTeacherDimensionValues(),
  );
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    source_profile_id: initial?.source_profile_id ?? systemProfiles[0]?.id ?? "",
    is_active: initial?.is_active ?? true,
    change_note: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const url = initial ? `/api/profiles/${initial.id}` : "/api/profiles";
    const method = initial ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        ...dimensions,
        ...(initial
          ? {}
          : { adaptation_level: "standard", options: DEFAULT_PROFILE_OPTIONS }),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Erreur");
      return;
    }
    router.push("/profiles");
    router.refresh();
  }

  const sourceProfile = systemProfiles.find((p) => p.id === form.source_profile_id);

  const teacherDimensionsForPreview = useMemo(
    () => ({
      custom_pedagogical_objectives: dimensions.custom_pedagogical_objectives,
      custom_linguistic_rules: dimensions.custom_linguistic_rules,
      custom_layout_rules: dimensions.custom_layout_rules,
      custom_structuring_rules: dimensions.custom_structuring_rules,
      custom_visual_aids: dimensions.custom_visual_aids,
      custom_audio_aids: dimensions.custom_audio_aids,
      custom_exercise_adaptations: dimensions.custom_exercise_adaptations,
      custom_evaluation_rules: dimensions.custom_evaluation_rules,
    }),
    [dimensions],
  );

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-red-600">{error}</p>}

      <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
        Ces règles complètent le profil système de référence. Ne saisissez pas de nom complet
        d&apos;élève ni de données médicales.
      </p>

      <div className="flex flex-wrap gap-2 pb-1" role="tablist" aria-label="Sections du profil">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`${TAB_BTN} ${
              activeTab === tab.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-slate-200 bg-white text-slate-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <>
          <Card>
            <CardHeader><CardTitle>Profil personnel</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Profil système source</Label>
                <select
                  id="source"
                  className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 text-base"
                  value={form.source_profile_id}
                  onChange={(e) => setForm({ ...form, source_profile_id: e.target.value })}
                >
                  {systemProfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" className={TEXTAREA} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <TeacherProfileSystemPromptPreview
            name={form.name}
            sourceProfile={sourceProfile}
            teacherDimensions={teacherDimensionsForPreview}
          />
        </>
      )}

      {activeTab === "dimensions" && (
        <ProfileDimensionsEditor
          mode="teacher"
          values={dimensions}
          previousValues={initial ? teacherDimensionsFromProfile(initial) : undefined}
          onChange={(column, rules) => setDimensions((prev) => ({ ...prev, [column]: rules }))}
        />
      )}

      {initial && (
        <div className="space-y-2">
          <Label htmlFor="change_note">Note de modification</Label>
          <Input id="change_note" value={form.change_note} onChange={(e) => setForm({ ...form, change_note: e.target.value })} />
        </div>
      )}

      <Button type="submit" disabled={loading} className="min-h-[44px] w-full">
        {loading ? "Enregistrement…" : initial ? "Enregistrer" : "Créer le profil"}
      </Button>
    </form>
  );
}
