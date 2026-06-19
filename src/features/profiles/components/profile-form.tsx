"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import { ADAPTATION_PROFILES } from "@/lib/constants/profiles";
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

export function ProfileForm() {
  const router = useRouter();
  const [form, setForm] = useState<LearnerProfileInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<string>("");
  const [loading, setLoading] = useState(false);

  function toggleAdaptationSlug(slug: string) {
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
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key],
      },
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
      router.push("/profiles");
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
    router.push("/profiles");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl">
      <PrivacyNotice />

      {errors && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-base text-red-600">{errors}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations du profil</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="profileName">Nom du profil *</Label>
            <Input
              id="profileName"
              className="w-full"
              placeholder="Ex. CM2 — lecture simplifiée"
              value={form.profileName}
              onChange={(e) => setForm({ ...form, profileName: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="approximateLevel">Niveau approximatif</Label>
            <Input
              id="approximateLevel"
              className="w-full"
              placeholder="Ex. CM2, 6e, cycle 3…"
              value={form.approximateLevel}
              onChange={(e) => setForm({ ...form, approximateLevel: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Types d&apos;adaptation *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ADAPTATION_PROFILES.map(({ slug, name }) => (
              <button
                key={slug}
                type="button"
                onClick={() => toggleAdaptationSlug(slug)}
                className={cn(
                  "rounded-full px-3 py-2 min-h-[44px] text-base font-medium border transition-colors",
                  form.adaptationSlugs.includes(slug)
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary/50",
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Préférences d&apos;adaptation</CardTitle>
        </CardHeader>
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
              className="cursor-pointer min-h-[44px] px-3 py-2"
              onClick={() => togglePreference(key)}
            >
              {label}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Besoins pédagogiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="flex min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            placeholder="Ex. phrases courtes, consignes étape par étape, plus de visuels…"
            value={form.pedagogicalNeeds}
            onChange={(e) => setForm({ ...form, pedagogicalNeeds: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes pédagogiques (facultatif)</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="flex min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            placeholder="Remarques utiles pour vos prochaines adaptations…"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Création..." : "Créer le profil"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          Annuler
        </Button>
      </div>
    </form>
  );
}
