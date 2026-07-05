"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileRuleListEditor } from "@/features/profiles/components/profile-rule-list-editor";
import { ProfileSystemPromptPreview } from "@/features/profiles/components/profile-system-prompt-preview";
import { AdminProfileHistoryPanel } from "@/features/admin-profiles/components/admin-profile-history-panel";
import {
  ADMIN_PROFILE_TABS,
  buildAdminProfileFormState,
  dimensionColumnForTab,
  type AdminProfileFormState,
  type AdminProfileTab,
} from "@/features/admin-profiles/components/admin-profile-form-state";
import type { PedagogicalProfile } from "@/types/pedagogical-profile";
import { DEFAULT_PROFILE_OPTIONS } from "@/types/pedagogical-profile";
import { PROFILE_DIMENSION_SECTIONS } from "@/types/pedagogical-dimensions";
import {
  getProfileCategoryLabel,
  isKnownProfileCategory,
  PEDAGOGICAL_PROFILE_CATEGORIES,
} from "@/types/pedagogical-profile-category";
import {
  getSortOrderLabel,
  isKnownSortOrder,
  PROFILE_SORT_ORDER_OPTIONS,
} from "@/types/pedagogical-profile-sort-order";
import { PEDAGOGICAL_OBJECTIVE_SUGGESTIONS } from "@/types/pedagogical-objective-suggestions";

const SELECT_CLASS =
  "min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const TEXTAREA =
  "flex min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const TAB_BTN =
  "min-h-[44px] shrink-0 rounded-lg border px-3 py-2 text-sm transition-colors";

/** Défilement horizontal des onglets uniquement si l’écran est trop étroit. */
const TAB_STRIP =
  "flex min-w-0 gap-2 pb-1 max-xl:flex-nowrap max-xl:overflow-x-auto xl:flex-wrap xl:overflow-visible";

interface AdminProfileEditorProps {
  initial?: PedagogicalProfile;
}

function sectionMetaForTab(tab: AdminProfileTab) {
  const map: Record<string, (typeof PROFILE_DIMENSION_SECTIONS)[number]["id"]> = {
    objectives: "objectives",
    language: "linguistic_rules",
    layout: "layout_rules",
    structure: "structure_rules",
    visual: "visual_aids",
    audio: "audio_aids",
    exercises: "exercise_adaptations",
    evaluation: "evaluation_rules",
  };
  const id = map[tab];
  return PROFILE_DIMENSION_SECTIONS.find((s) => s.id === id);
}

export function AdminProfileEditor({ initial }: AdminProfileEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminProfileTab>("general");
  const [form, setForm] = useState<AdminProfileFormState>(() => buildAdminProfileFormState(initial));
  const previousDimensions = useMemo(
    () => (initial ? buildAdminProfileFormState(initial) : undefined),
    [initial],
  );

  function updateDimension(column: keyof AdminProfileFormState, rules: string[]) {
    setForm((prev) => ({ ...prev, [column]: rules }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const url = initial ? `/api/admin/profiles/${initial.id}` : "/api/admin/profiles";
    const method = initial ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        initial
          ? form
          : {
              ...form,
              adaptation_level: "standard",
              options: DEFAULT_PROFILE_OPTIONS,
            },
      ),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : JSON.stringify(data.error) ?? "Erreur");
      return;
    }
    router.push("/admin/profiles");
    router.refresh();
  }

  const dimensionTab = dimensionColumnForTab(activeTab);
  const sectionMeta = sectionMetaForTab(activeTab);

  const promptDimensions = useMemo(
    () => ({
      pedagogical_objectives: form.pedagogical_objectives,
      linguistic_rules: form.linguistic_rules,
      layout_rules: form.layout_rules,
      structuring_rules: form.structuring_rules,
      visual_aids: form.visual_aids,
      audio_aids: form.audio_aids,
      exercise_adaptations: form.exercise_adaptations,
      evaluation_rules: form.evaluation_rules,
    }),
    [
      form.pedagogical_objectives,
      form.linguistic_rules,
      form.layout_rules,
      form.structuring_rules,
      form.visual_aids,
      form.audio_aids,
      form.exercise_adaptations,
      form.evaluation_rules,
    ],
  );

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className={TAB_STRIP} role="tablist" aria-label="Sections du profil">
        {ADMIN_PROFILE_TABS.filter((t) => t.id !== "history" || initial).map((tab) => (
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

      <div className="w-full space-y-4">
      {activeTab === "general" && (
        <>
          <Card>
            <CardHeader><CardTitle>Identité</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2 sm:col-span-1">
                <Label htmlFor="name">Nom *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Code profil *</Label>
                <Input id="slug" disabled={Boolean(initial)} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  className={SELECT_CLASS}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {!isKnownProfileCategory(form.category) && form.category && (
                    <option value={form.category}>{getProfileCategoryLabel(form.category)}</option>
                  )}
                  {PEDAGOGICAL_PROFILE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Ordre d&apos;affichage</Label>
                <select
                  id="sort_order"
                  className={SELECT_CLASS}
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                >
                  {!isKnownSortOrder(form.sort_order) && (
                    <option value={form.sort_order}>{getSortOrderLabel(form.sort_order)}</option>
                  )}
                  {PROFILE_SORT_ORDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex min-h-[44px] items-center gap-3 sm:col-span-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <Label htmlFor="is_active" className="cursor-pointer font-normal">
                  Profil actif
                </Label>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" className={TEXTAREA} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <ProfileSystemPromptPreview name={form.name} dimensions={promptDimensions} />
        </>
      )}

      {dimensionTab && sectionMeta && (
        <ProfileRuleListEditor
          title={sectionMeta.title}
          description={sectionMeta.description}
          placeholder={sectionMeta.placeholder}
          value={form[dimensionTab] as string[]}
          previousValue={previousDimensions?.[dimensionTab] as string[] | undefined}
          suggestions={
            sectionMeta.id === "objectives" ? PEDAGOGICAL_OBJECTIVE_SUGGESTIONS : undefined
          }
          onChange={(rules) => updateDimension(dimensionTab, rules)}
        />
      )}

      {activeTab === "history" && initial && (
        <Card>
          <CardHeader><CardTitle>Historique des versions</CardTitle></CardHeader>
          <CardContent>
            <AdminProfileHistoryPanel profileId={initial.id} />
          </CardContent>
        </Card>
      )}

      {activeTab !== "history" && initial && (
        <div className="space-y-2">
          <Label htmlFor="change_note">Note de modification</Label>
          <Input id="change_note" value={form.change_note} onChange={(e) => setForm({ ...form, change_note: e.target.value })} />
        </div>
      )}

      {activeTab !== "history" && (
        <Button type="submit" disabled={loading} className="min-h-[44px] w-full sm:w-auto">
          {loading ? "Enregistrement…" : "Enregistrer"}
        </Button>
      )}
      </div>
    </form>
  );
}
