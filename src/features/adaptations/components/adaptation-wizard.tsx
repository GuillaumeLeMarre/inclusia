"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdaptationLevelSelector } from "@/features/falc/components/adaptation-level-selector";
import type { AdaptationLevel } from "@/types/adaptation-level";
import type { Document, LearnerProfile } from "@/types";
import type { PedagogicalProfile, TeacherProfile } from "@/types/pedagogical-profile";

const SELECT_CLASS =
  "w-full min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

interface AdaptationWizardProps {
  profiles: LearnerProfile[];
  documents: Document[];
  systemProfiles: PedagogicalProfile[];
  teacherProfiles: TeacherProfile[];
}

export function AdaptationWizard({
  profiles,
  documents,
  systemProfiles,
  teacherProfiles,
}: AdaptationWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [learnerProfileId, setLearnerProfileId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [pedagogicalSelection, setPedagogicalSelection] = useState("");
  const [adaptationLevel, setAdaptationLevel] = useState<AdaptationLevel>("standard");
  const [generatePictograms, setGeneratePictograms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const teacherId = searchParams.get("teacherProfileId");
    const systemId = searchParams.get("pedagogicalProfileId");
    const slug = searchParams.get("pedagogicalProfileSlug");
    if (teacherId) setPedagogicalSelection(`teacher:${teacherId}`);
    else if (systemId) setPedagogicalSelection(`system:${systemId}`);
    else if (slug) setPedagogicalSelection(`slug:${slug}`);
  }, [searchParams]);

  function parseSelection() {
    const [kind, id] = pedagogicalSelection.split(":");
    if (kind === "teacher") return { teacherProfileId: id };
    if (kind === "system") return { pedagogicalProfileId: id };
    if (kind === "slug") return { pedagogicalProfileSlug: id };
    return {};
  }

  async function handleAdapt() {
    setError("");
    if (!learnerProfileId || !documentId || !pedagogicalSelection) {
      setError("Sélectionnez un profil apprenant, un document et un profil pédagogique.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: learnerProfileId,
          documentId,
          ...parseSelection(),
          adaptationLevel,
          generatePictograms,
        }),
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
    <div className="w-full max-w-3xl space-y-4 md:space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-base text-red-600">{error}</p>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">1. Profil apprenant</CardTitle></CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <p className="text-base text-slate-500">
              Aucun profil apprenant.{" "}
              <a href="/learners/new" className="text-primary underline">Créer un profil</a>
            </p>
          ) : (
            <select
              className={SELECT_CLASS}
              value={learnerProfileId}
              aria-label="Sélectionner un profil apprenant"
              onChange={(e) => setLearnerProfileId(e.target.value)}
            >
              <option value="">Sélectionner…</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.profile_name}
                  {p.approximate_level ? ` (${p.approximate_level})` : ""}
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">2. Document</CardTitle></CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-base text-slate-500">
              Aucun document.{" "}
              <a href="/documents" className="text-primary underline">Importer un document</a>
            </p>
          ) : (
            <select
              className={SELECT_CLASS}
              value={documentId}
              aria-label="Sélectionner un document"
              onChange={(e) => setDocumentId(e.target.value)}
            >
              <option value="">Sélectionner…</option>
              {documents.filter((d) => d.status === "ready").map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">3. Profil pédagogique</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <select
            className={SELECT_CLASS}
            value={pedagogicalSelection}
            aria-label="Sélectionner un profil pédagogique"
            onChange={(e) => setPedagogicalSelection(e.target.value)}
          >
            <option value="">Sélectionner…</option>
            {teacherProfiles.length > 0 && (
              <optgroup label="Mes profils">
                {teacherProfiles.map((p) => (
                  <option key={p.id} value={`teacher:${p.id}`}>{p.name}</option>
                ))}
              </optgroup>
            )}
            <optgroup label="Profils système">
              {systemProfiles.map((p) => (
                <option key={p.id} value={p.id.startsWith("fallback:") ? `slug:${p.slug}` : `system:${p.id}`}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          </select>
          <p className="text-sm text-slate-500">
            <a href="/profiles" className="text-primary underline">Gérer vos profils pédagogiques</a>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">4. Niveau et options</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <AdaptationLevelSelector value={adaptationLevel} onChange={setAdaptationLevel} />
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4">
            <input
              type="checkbox"
              checked={generatePictograms}
              onChange={(e) => setGeneratePictograms(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-base text-slate-700">
              Générer des pictogrammes
              <span className="block text-sm text-slate-500">Illustrations ARASAAC</span>
            </span>
          </label>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full min-h-[44px]"
        disabled={loading || !learnerProfileId || !documentId || !pedagogicalSelection}
        onClick={handleAdapt}
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Adaptation en cours…</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Adapter le cours</>
        )}
      </Button>
    </div>
  );
}
