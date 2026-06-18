import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileName } from "@/lib/constants/profiles";
import type { Adaptation } from "@/types";

interface AdaptationResultProps {
  adaptation: Adaptation;
  studentName?: string;
  documentTitle?: string;
}

export function AdaptationResult({
  adaptation,
  studentName,
  documentTitle,
}: AdaptationResultProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {adaptation.is_demo && <Badge variant="accent">Mode démo</Badge>}
        {adaptation.profile_slugs.map((slug) => (
          <Badge key={slug}>{getProfileName(slug)}</Badge>
        ))}
        {adaptation.processing_time_ms && (
          <span className="text-xs text-slate-400">
            Généré en {(adaptation.processing_time_ms / 1000).toFixed(1)}s
          </span>
        )}
      </div>

      {(studentName || documentTitle) && (
        <p className="text-sm text-slate-500">
          {studentName && <>Élève : <strong>{studentName}</strong></>}
          {studentName && documentTitle && " · "}
          {documentTitle && <>Document : <strong>{documentTitle}</strong></>}
        </p>
      )}

      <ResultCard title="Cours adapté" content={adaptation.adapted_content} />
      <ResultCard title="Résumé" content={adaptation.summary} />
      <ResultCard title="Fiche mémoire" content={adaptation.memory_sheet} />
      <ResultCard title="Consignes adaptées" content={adaptation.adapted_instructions} />

      {adaptation.keywords && adaptation.keywords.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Vocabulaire clé</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {adaptation.keywords.map((kw) => (
              <div key={kw.term} className="rounded-lg bg-slate-50 p-3">
                <p className="font-medium text-primary">{kw.term}</p>
                <p className="text-sm text-slate-600">{kw.definition}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {adaptation.quiz?.questions && (
        <Card>
          <CardHeader><CardTitle>Quiz</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {adaptation.quiz.questions.map((q, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-4">
                <p className="font-medium mb-2">{i + 1}. {q.question}</p>
                <ul className="space-y-1">
                  {q.options.map((opt, j) => (
                    <li
                      key={j}
                      className={`text-sm px-2 py-1 rounded ${j === q.correct_index ? "bg-emerald-50 text-emerald-700" : "text-slate-600"}`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {adaptation.simplified_questions && (
        <Card>
          <CardHeader><CardTitle>Questions simplifiées</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {adaptation.simplified_questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {adaptation.mindmap && (
        <Card>
          <CardHeader><CardTitle>Schéma conceptuel</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {adaptation.mindmap.nodes.map((node) => (
                <Badge key={node.id} variant="secondary">{node.label}</Badge>
              ))}
            </div>
            <ul className="text-sm text-slate-500 space-y-1">
              {adaptation.mindmap.links.map((link, i) => (
                <li key={i}>{link.source} → {link.target}{link.label ? ` (${link.label})` : ""}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {adaptation.audio_script && (
        <ResultCard title="Script audio" content={adaptation.audio_script} />
      )}
    </div>
  );
}

function ResultCard({ title, content }: { title: string; content: string | null }) {
  if (!content) return null;
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
