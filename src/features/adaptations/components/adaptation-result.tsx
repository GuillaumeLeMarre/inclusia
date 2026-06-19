"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchemaPanel } from "@/features/mindmaps/components/schema-panel";
import { getProfileName } from "@/lib/constants/profiles";
import type { Adaptation } from "@/types";

interface AdaptationResultProps {
  adaptation: Adaptation;
  profileName?: string;
  documentTitle?: string;
}

export function AdaptationResult({
  adaptation,
  profileName,
  documentTitle,
}: AdaptationResultProps) {
  const [activeTab, setActiveTab] = useState("resume");

  return (
    <div className="space-y-6">
      <AdaptationMeta
        adaptation={adaptation}
        profileName={profileName}
        documentTitle={documentTitle}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className="grid w-full grid-cols-2 h-auto gap-1 sm:grid-cols-4"
          aria-label="Sections de l'adaptation"
        >
          <TabsTrigger value="resume" className="min-h-[44px]">Résumé</TabsTrigger>
          <TabsTrigger value="fiche" className="min-h-[44px]">Fiche mémoire</TabsTrigger>
          <TabsTrigger value="quiz" className="min-h-[44px]">Quiz</TabsTrigger>
          <TabsTrigger value="schema" className="min-h-[44px]">Schéma</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-4 mt-4">
          <ResultCard title="Résumé" content={adaptation.summary} />
          <ResultCard title="Cours adapté" content={adaptation.adapted_content} />
        </TabsContent>

        <TabsContent value="fiche" className="space-y-4 mt-4">
          <ResultCard title="Fiche mémoire" content={adaptation.memory_sheet} />
          <ResultCard title="Consignes adaptées" content={adaptation.adapted_instructions} />
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          <QuizSection adaptation={adaptation} />
        </TabsContent>

        <TabsContent value="schema" className="mt-4" forceMount>
          <SchemaPanel
            adaptationId={adaptation.id}
            initialMermaid={adaptation.mindmap_mermaid}
            active={activeTab === "schema"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdaptationMeta({
  adaptation,
  profileName,
  documentTitle,
}: {
  adaptation: Adaptation;
  profileName?: string;
  documentTitle?: string;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {adaptation.is_demo && <Badge variant="accent">Mode démo</Badge>}
        {adaptation.profile_slugs.map((slug) => (
          <Badge key={slug}>{getProfileName(slug)}</Badge>
        ))}
        {adaptation.processing_time_ms && (
          <span className="text-base text-slate-500">
            Généré en {(adaptation.processing_time_ms / 1000).toFixed(1)}s
          </span>
        )}
      </div>
      {(profileName || documentTitle) && (
        <p className="text-base text-slate-500">
          {profileName && <>Profil : <strong>{profileName}</strong></>}
          {profileName && documentTitle && " · "}
          {documentTitle && <>Document : <strong>{documentTitle}</strong></>}
        </p>
      )}
    </>
  );
}

function ResultCard({
  title,
  content,
}: {
  title: string;
  content: string | null;
}) {
  if (!content) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="prose prose-base max-w-none whitespace-pre-wrap text-slate-700 break-words dark:text-slate-300">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}

function QuizSection({ adaptation }: { adaptation: Adaptation }) {
  if (!adaptation.quiz?.questions?.length) {
    return <p className="text-base text-slate-500">Aucun quiz disponible.</p>;
  }
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Quiz</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {adaptation.quiz.questions.map((q, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4">
            <p className="font-medium mb-2 text-base">{i + 1}. {q.question}</p>
            <ul className="space-y-2">
              {q.options.map((opt, j) => (
                <li
                  key={j}
                  className={`text-base px-3 py-2 rounded min-h-[44px] flex items-center ${j === q.correct_index ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300"}`}
                >
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
