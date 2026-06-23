"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { learnerProfileSchema, type LearnerProfileInput } from "@/schemas/profile.schema";
import { cn } from "@/lib/utils";

const DEFAULT_FORM: LearnerProfileInput = {
  profileName: "",
  approximateLevel: "",
  adaptationSlugs: [],
  pedagogicalNeeds: "",
  notes: "",
  preferences: {
    audioEnabled: false,
    diagramsEnabled: true,
    quizEnabled: true,
    simplifiedVocab: false,
    adaptedFont: false,
    simplifiedText: true,
  },
};

interface LearnerProfileFormProps {
  pedagogicalSlugs: { slug: string; name: string }[];
}

export function LearnerProfileForm({ pedagogicalSlugs }: LearnerProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<LearnerProfileInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleSlug(slug: string) {
    setForm((prev) => ({
      ...prev,
      adaptationSlugs: prev.adaptationSlugs.includes(slug)
        ? prev.adaptationSlugs.filter((s) => s !== slug)
        : [...prev.adaptationSlugs, slug],
    }));
  }

  function togglePreference(key: keyof LearnerProfileInput["preferences"]) {
    setForm((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: !prev.preferences[key] },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = learnerProfileSchema.safeParse(form);
    if (!result.success) {
      setErrors(result.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setErrors("");
    setLoading(true);

    if (!isSupabaseConfigured()) {
      router.push("/learners");
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrors("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from("learner_profiles")
      .insert({
        teacher_id: user.id,
        profile_name: form.profileName,
        approximate_level: form.approximateLevel || null,
        adaptation_slugs: form.adaptationSlugs,
        pedagogical_needs: form.pedagogicalNeeds || null,
        notes: form.notes || null,
      })
      .select("id")
      .single();

    if (error || !profile) {
      setErrors(error?.message ?? "Erreur lors de la création.");
      setLoading(false);
      return;
    }

    await supabase.from("learning_preferences").upsert({
      profile_id: profile.id,
      audio_enabled: form.preferences.audioEnabled,
      diagrams_enabled: form.preferences.diagramsEnabled,
      quiz_enabled: form.preferences.quizEnabled,
      simplified_vocab: form.preferences.simplifiedVocab,
      adapted_font: form.preferences.adaptedFont,
      simplified_text: form.preferences.simplifiedText,
    });

    setLoading(false);
    router.push("/learners");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      <PrivacyNotice />
      {errors && <p className="rounded-lg bg-red-50 px-3 py-2 text-base text-red-600">{errors}</p>}

      <Card>
        <CardHeader><CardTitle>Informations du profil apprenant</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="profileName">Nom du profil *</Label>
            <Input
              id="profileName"
              placeholder="Ex. CM2 — lecture simplifiée"
              value={form.profileName}
              onChange={(e) => setForm({ ...form, profileName: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="approximateLevel">Niveau approximatif</Label>
            <Input
              id="approximateLevel"
              placeholder="Ex. CM2, 6e, cycle 3…"
              value={form.approximateLevel}
              onChange={(e) => setForm({ ...form, approximateLevel: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Besoins d&apos;adaptation *</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {pedagogicalSlugs.map(({ slug, name }) => (
              <button
                key={slug}
                type="button"
                onClick={() => toggleSlug(slug)}
                className={cn(
                  "min-h-[44px] rounded-full border px-3 py-2 text-base font-medium transition-colors",
                  form.adaptationSlugs.includes(slug)
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary/50",
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Préférences pédagogiques</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {([
            ["audioEnabled", "Audio"],
            ["diagramsEnabled", "Schémas"],
            ["quizEnabled", "Quiz"],
            ["simplifiedVocab", "Vocabulaire simplifié"],
            ["adaptedFont", "Police adaptée"],
            ["simplifiedText", "Texte simplifié"],
          ] as const).map(([key, label]) => (
            <Badge
              key={key}
              variant={form.preferences[key] ? "default" : "outline"}
              className="min-h-[44px] cursor-pointer px-3 py-2"
              onClick={() => togglePreference(key)}
            >
              {label}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Besoins pédagogiques</CardTitle></CardHeader>
        <CardContent>
          <textarea
            className="flex min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            placeholder="Ex. phrases courtes, consignes étape par étape, plus de visuels…"
            value={form.pedagogicalNeeds}
            onChange={(e) => setForm({ ...form, pedagogicalNeeds: e.target.value })}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={loading}>{loading ? "Création…" : "Créer le profil"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
      </div>
    </form>
  );
}
