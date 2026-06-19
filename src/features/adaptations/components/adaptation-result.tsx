"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const meta = (
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

  return (
    <div className="space-y-6">
      {meta}

      {/* Mobile: onglets */}
      <div className="md:hidden">
        <Tabs defaultValue="cours" className="w-full">
          <TabsList className="w-full" aria-label="Sections de l'adaptation">
            <TabsTrigger value="cours">Cours</TabsTrigger>
            <TabsTrigger value="fiche">Fiche</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="plus">Plus</TabsTrigger>
          </TabsList>
          <TabsContent value="cours">
            <ResultCard title="Cours adapté" content={adaptation.adapted_content} />
            <ResultCard title="Résumé" content={adaptation.summary} className="mt-4" />
          </TabsContent>
          <TabsContent value="fiche">
            <ResultCard title="Fiche mémoire" content={adaptation.memory_sheet} />
            <ResultCard title="Consignes adaptées" content={adaptation.adapted_instructions} className="mt-4" />
          </TabsContent>
          <TabsContent value="quiz">
            <QuizSection adaptation={adaptation} />
          </TabsContent>
          <TabsContent value="plus">
            <ExtraSections adaptation={adaptation} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: vue complète */}
      <div className="hidden md:block space-y-6">
        <ResultCard title="Cours adapté" content={adaptation.adapted_content} />
        <ResultCard title="Résumé" content={adaptation.summary} />
        <ResultCard title="Fiche mémoire" content={adaptation.memory_sheet} />
        <ResultCard title="Consignes adaptées" content={adaptation.adapted_instructions} />
        <KeywordsSection adaptation={adaptation} />
        <QuizSection adaptation={adaptation} />
        <SimplifiedQuestions adaptation={adaptation} />
        <MindmapSection adaptation={adaptation} />
        <ResultCard title="Script audio" content={adaptation.audio_script} />
      </div>
    </div>
  );
}

function ResultCard({
  title,
  content,
  className,
}: {
  title: string;
  content: string | null;
  className?: string;
}) {
  if (!content) return null;
  return (
    <Card className={className}>
      <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="prose prose-base max-w-none whitespace-pre-wrap text-slate-700 break-words">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}

function KeywordsSection({ adaptation }: { adaptation: Adaptation }) {
  if (!adaptation.keywords?.length) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Vocabulaire clé</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {adaptation.keywords.map((kw) => (
          <div key={kw.term} className="rounded-lg bg-slate-50 p-3">
            <p className="font-medium text-primary">{kw.term}</p>
            <p className="text-base text-slate-600">{kw.definition}</p>
          </div>
        ))}
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
                  className={`text-base px-3 py-2 rounded min-h-[44px] flex items-center ${j === q.correct_index ? "bg-emerald-50 text-emerald-800" : "text-slate-600 bg-slate-50"}`}
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

function SimplifiedQuestions({ adaptation }: { adaptation: Adaptation }) {
  if (!adaptation.simplified_questions?.length) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Questions simplifiées</CardTitle></CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-2 text-base">
          {adaptation.simplified_questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function MindmapSection({ adaptation }: { adaptation: Adaptation }) {
  if (!adaptation.mindmap) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Schéma conceptuel</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {adaptation.mindmap.nodes.map((node) => (
            <Badge key={node.id} variant="secondary">{node.label}</Badge>
          ))}
        </div>
        <ul className="text-base text-slate-500 space-y-1">
          {adaptation.mindmap.links.map((link, i) => (
            <li key={i}>{link.source} → {link.target}{link.label ? ` (${link.label})` : ""}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ExtraSections({ adaptation }: { adaptation: Adaptation }) {
  return (
    <div className="space-y-4">
      <KeywordsSection adaptation={adaptation} />
      <SimplifiedQuestions adaptation={adaptation} />
      <MindmapSection adaptation={adaptation} />
      <ResultCard title="Script audio" content={adaptation.audio_script} />
    </div>
  );
}
