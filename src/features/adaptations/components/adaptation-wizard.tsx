"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ADAPTATION_PROFILES, getProfileName } from "@/lib/constants/profiles";
import { cn } from "@/lib/utils";
import type { Document, Student } from "@/types";

interface AdaptationWizardProps {
  students: Student[];
  documents: Document[];
}

export function AdaptationWizard({ students, documents }: AdaptationWizardProps) {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [profiles, setProfiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedStudent = students.find((s) => s.id === studentId);

  function toggleProfile(slug: string) {
    setProfiles((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug],
    );
  }

  function selectStudentProfiles() {
    if (selectedStudent?.profiles.length) {
      setProfiles(selectedStudent.profiles);
    }
  }

  async function handleAdapt() {
    setError("");
    if (!studentId || !documentId || profiles.length === 0) {
      setError("Sélectionnez un élève, un document et au moins un profil.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, documentId, profileSlugs: profiles }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Adaptation échouée");
      router.push(`/adaptations/${data.adaptation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adaptation échouée");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <Card>
        <CardHeader><CardTitle>1. Choisir un élève</CardTitle></CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun élève. <a href="/students/new" className="text-primary underline">Créer un élève</a></p>
          ) : (
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setProfiles([]);
              }}
            >
              <option value="">Sélectionner...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} {s.class_name ? `(${s.class_name})` : ""}
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. Choisir un document</CardTitle></CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun document. <a href="/documents" className="text-primary underline">Importer un document</a></p>
          ) : (
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {documents.filter((d) => d.status === "ready").map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            3. Profils d&apos;adaptation
            {selectedStudent && (
              <Button type="button" variant="ghost" size="sm" onClick={selectStudentProfiles}>
                Profils de l&apos;élève
              </Button>
            )}
          </CardTitle>
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
                  profiles.includes(slug)
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary/50",
                )}
              >
                {name}
              </button>
            ))}
          </div>
          {profiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {profiles.map((slug) => (
                <Badge key={slug}>{getProfileName(slug)}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full"
        disabled={loading || !studentId || !documentId || profiles.length === 0}
        onClick={handleAdapt}
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Adaptation en cours...</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Adapter le cours</>
        )}
      </Button>
    </div>
  );
}
