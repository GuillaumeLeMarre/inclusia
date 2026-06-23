"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdaptationLevel } from "@/types/adaptation-level";
import { ADAPTATION_LEVELS, isAdaptationLevel } from "@/types/adaptation-level";
import { DEFAULT_PROFILE_OPTIONS } from "@/types/pedagogical-profile";
import type { PedagogicalProfile } from "@/types/pedagogical-profile";

const TEXTAREA =
  "flex min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

interface AdminProfileEditorProps {
  initial?: PedagogicalProfile;
}

export function AdminProfileEditor({ initial }: AdminProfileEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    category: initial?.category ?? "learning",
    description: initial?.description ?? "",
    system_prompt: initial?.system_prompt ?? "",
    user_prompt: initial?.user_prompt ?? "",
    pedagogical_rules: initial?.pedagogical_rules ?? "",
    adaptation_level: initial?.adaptation_level ?? "standard",
    options: initial?.options ?? { ...DEFAULT_PROFILE_OPTIONS },
    is_active: initial?.is_active ?? true,
    sort_order: initial?.sort_order ?? 0,
    change_note: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const url = initial ? `/api/admin/profiles/${initial.id}` : "/api/admin/profiles";
    const method = initial ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(JSON.stringify(data.error) ?? "Erreur");
      return;
    }
    router.push("/admin/profiles");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <Card>
        <CardHeader><CardTitle>Identité</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              disabled={Boolean(initial)}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Niveau d&apos;adaptation</Label>
            <select
              id="level"
              className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3"
              value={form.adaptation_level}
              onChange={(e) => {
                const value = e.target.value;
                if (isAdaptationLevel(value)) {
                  setForm({ ...form, adaptation_level: value });
                }
              }}
            >
              {ADAPTATION_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
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
        <CardHeader><CardTitle>Prompts</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="system_prompt">
              Prompt système ({form.system_prompt.length} car.)
            </Label>
            <textarea
              id="system_prompt"
              className={TEXTAREA}
              value={form.system_prompt}
              onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user_prompt">
              Prompt utilisateur ({form.user_prompt.length} car.)
            </Label>
            <textarea
              id="user_prompt"
              className={TEXTAREA}
              value={form.user_prompt}
              onChange={(e) => setForm({ ...form, user_prompt: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pedagogical_rules">
              Règles pédagogiques ({form.pedagogical_rules.length} car.)
            </Label>
            <textarea
              id="pedagogical_rules"
              className={TEXTAREA}
              value={form.pedagogical_rules}
              onChange={(e) => setForm({ ...form, pedagogical_rules: e.target.value })}
            />
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

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading} className="min-h-[44px]">
          {loading ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <label className="flex min-h-[44px] items-center gap-2 text-base">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Profil actif
        </label>
      </div>
    </form>
  );
}
