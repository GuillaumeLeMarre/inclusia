"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ADAPTATION_PROFILES, getProfileName } from "@/lib/constants/profiles";
import { cn } from "@/lib/utils";
import type { Document, LearnerProfile } from "@/types";

const SELECT_CLASS =
  "w-full min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

interface AdaptationWizardProps {
  profiles: LearnerProfile[];
  documents: Document[];
}

export function AdaptationWizard({ profiles, documents }: AdaptationWizardProps) {
  const router = useRouter();
  const [profileId, setProfileId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [adaptationSlugs, setAdaptationSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedProfile = profiles.find((p) => p.id === profileId);

  function toggleSlug(slug: string) {
    setAdaptationSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function applyProfileSlugs() {
    if (selectedProfile?.adaptation_slugs.length) {
      setAdaptationSlugs(selectedProfile.adaptation_slugs);
    }
  }

  async function handleAdapt() {
    setError("");
    if (!profileId || !documentId || adaptationSlugs.length === 0) {
      setError("Sélectionnez un profil, un document et au moins un type d'adaptation.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, documentId, profileSlugs: adaptationSlugs }),
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
        <CardHeader><CardTitle className="text-lg">1. Choisir un profil</CardTitle></CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <p className="text-base text-slate-500">
              Aucun profil.{" "}
              <a href="/profiles/new" className="text-primary underline">Créer un profil</a>
            </p>
          ) : (
            <select
              className={SELECT_CLASS}
              value={profileId}
              aria-label="Sélectionner un profil d'adaptation"
              onChange={(e) => {
                setProfileId(e.target.value);
                setAdaptationSlugs([]);
              }}
            >
              <option value="">Sélectionner...</option>
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
        <CardHeader><CardTitle className="text-lg">2. Choisir un document</CardTitle></CardHeader>
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
          <CardTitle className="text-lg flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>3. Types d&apos;adaptation</span>
            {selectedProfile && (
              <Button type="button" variant="ghost" size="sm" onClick={applyProfileSlugs} className="w-full sm:w-auto">
                Utiliser ceux du profil
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
                onClick={() => toggleSlug(slug)}
                className={cn(
                  "rounded-full px-3 py-2 min-h-[44px] text-base font-medium border transition-colors",
                  adaptationSlugs.includes(slug)
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary/50",
                )}
              >
                {name}
              </button>
            ))}
          </div>
          {adaptationSlugs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {adaptationSlugs.map((slug) => (
                <Badge key={slug}>{getProfileName(slug)}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full"
        disabled={loading || !profileId || !documentId || adaptationSlugs.length === 0}
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
