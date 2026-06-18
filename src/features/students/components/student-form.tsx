"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ADAPTATION_PROFILES } from "@/lib/constants/profiles";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { studentSchema, type StudentInput } from "@/schemas/auth.schema";
import { cn } from "@/lib/utils";

const DEFAULT_FORM: StudentInput = {
  firstName: "",
  lastName: "",
  className: "",
  gradeLevel: "",
  profiles: [],
  needs: "",
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

export function StudentForm() {
  const router = useRouter();
  const [form, setForm] = useState<StudentInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<string>("");
  const [loading, setLoading] = useState(false);

  function toggleProfile(slug: string) {
    setForm((prev) => ({
      ...prev,
      profiles: prev.profiles.includes(slug)
        ? prev.profiles.filter((p) => p !== slug)
        : [...prev.profiles, slug],
    }));
  }

  function togglePreference(key: keyof StudentInput["preferences"]) {
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
    const result = studentSchema.safeParse(form);
    if (!result.success) {
      setErrors(result.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setErrors("");
    setLoading(true);

    if (!isSupabaseConfigured()) {
      router.push("/students");
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrors("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    const { data: student, error } = await supabase
      .from("students")
      .insert({
        teacher_id: user.id,
        first_name: form.firstName,
        last_name: form.lastName,
        class_name: form.className || null,
        grade_level: form.gradeLevel || null,
        profiles: form.profiles,
        needs: form.needs || null,
        notes: form.notes || null,
      })
      .select("id")
      .single();

    if (error || !student) {
      setErrors(error?.message ?? "Erreur lors de la création.");
      setLoading(false);
      return;
    }

    await supabase.from("learning_preferences").upsert({
      student_id: student.id,
      audio_enabled: form.preferences.audioEnabled,
      diagrams_enabled: form.preferences.diagramsEnabled,
      quiz_enabled: form.preferences.quizEnabled,
      simplified_vocab: form.preferences.simplifiedVocab,
      adapted_font: form.preferences.adaptedFont,
      simplified_text: form.preferences.simplifiedText,
    });

    setLoading(false);
    router.push("/students");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {errors && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="className">Classe</Label>
            <Input
              id="className"
              placeholder="CM2-A"
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradeLevel">Niveau</Label>
            <Input
              id="gradeLevel"
              placeholder="CM2"
              value={form.gradeLevel}
              onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profils d&apos;adaptation *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ADAPTATION_PROFILES.map(({ slug, name }) => (
              <button
                key={slug}
                type="button"
                onClick={() => toggleProfile(slug)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium border transition-colors",
                  form.profiles.includes(slug)
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
          <CardTitle>Préférences pédagogiques</CardTitle>
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
              className="cursor-pointer"
              onClick={() => togglePreference(key)}
            >
              {label}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Besoins particuliers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            placeholder="Décrivez les besoins spécifiques de l'élève..."
            value={form.needs}
            onChange={(e) => setForm({ ...form, needs: e.target.value })}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer l'élève"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
