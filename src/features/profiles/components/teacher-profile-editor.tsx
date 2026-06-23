"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADAPTATION_LEVELS } from "@/types/adaptation-level";
import type { PedagogicalProfile } from "@/types/pedagogical-profile";
import { DEFAULT_PROFILE_OPTIONS } from "@/types/pedagogical-profile";

const TEXTAREA =
  "flex min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

interface TeacherProfileEditorProps {
  systemProfiles: PedagogicalProfile[];
  initial?: {
    id: string;
    name: string;
    description: string | null;
    source_profile_id: string | null;
    custom_prompt: string | null;
    custom_rules: string | null;
    adaptation_level: string;
    options: typeof DEFAULT_PROFILE_OPTIONS;
    is_active: boolean;
  };
}

export function TeacherProfileEditor({ systemProfiles, initial }: TeacherProfileEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    source_profile_id: initial?.source_profile_id ?? systemProfiles[0]?.id ?? "",
    custom_prompt: initial?.custom_prompt ?? "",
    custom_rules: initial?.custom_rules ?? "",
    adaptation_level: initial?.adaptation_level ?? "standard",
    options: initial?.options ?? { ...DEFAULT_PROFILE_OPTIONS },
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
      body: JSON.stringify(form),
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

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-red-600">{error}</p>}

      <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
        Ne pas renseigner de nom complet ni de données médicales.
      </p>

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
            <textarea
              id="description"
              className={TEXTAREA}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Personnalisation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom_rules">Règles personnalisées</Label>
            <textarea
              id="custom_rules"
              className={TEXTAREA}
              placeholder="Ex. Limiter les phrases à 8 mots"
              value={form.custom_rules}
              onChange={(e) => setForm({ ...form, custom_rules: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom_prompt">Prompt personnalisé</Label>
            <textarea
              id="custom_prompt"
              className={TEXTAREA}
              placeholder="Ex. Ajouter systématiquement une fiche mémoire"
              value={form.custom_prompt}
              onChange={(e) => setForm({ ...form, custom_prompt: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Niveau d&apos;adaptation</Label>
            <select
              id="level"
              className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 text-base"
              value={form.adaptation_level}
              onChange={(e) => setForm({ ...form, adaptation_level: e.target.value })}
            >
              {ADAPTATION_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {initial && (
        <div className="space-y-2">
          <Label htmlFor="change_note">Note de modification</Label>
          <Input
            id="change_note"
            value={form.change_note}
            onChange={(e) => setForm({ ...form, change_note: e.target.value })}
          />
        </div>
      )}

      <Button type="submit" disabled={loading} className="min-h-[44px]">
        {loading ? "Enregistrement…" : initial ? "Enregistrer" : "Créer le profil"}
      </Button>
    </form>
  );
}
