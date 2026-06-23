"use client";

import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildAdaptationSummary } from "@/lib/adaptations/adaptation-summary";
import type { Adaptation } from "@/types";
import { cn } from "@/lib/utils";

interface AdaptationProfileSummaryProps {
  adaptation: Adaptation;
  profileName?: string;
  documentTitle?: string;
}

export function AdaptationProfileSummary({
  adaptation,
  profileName,
  documentTitle,
}: AdaptationProfileSummaryProps) {
  const summary = buildAdaptationSummary(adaptation, profileName, documentTitle);

  if (summary.profiles.length === 0 && summary.extras.length === 0) {
    return null;
  }

  const previewParts = [
    summary.profileName,
    summary.levelLabel,
    summary.profiles.length > 0
      ? `${summary.profiles.length} profil${summary.profiles.length > 1 ? "s" : ""} pédagogique${summary.profiles.length > 1 ? "s" : ""}`
      : null,
  ].filter(Boolean);

  return (
    <Card className="border-primary/20 bg-primary/[0.03]">
      <details className="group [&>summary::-webkit-details-marker]:hidden">
        <summary
          className={cn(
            "flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3",
            "px-4 py-4 sm:px-6",
            "rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          <div className="min-w-0 flex-1 space-y-1">
            <span className="block text-lg font-semibold text-slate-900 dark:text-slate-50">
              Résumé des adaptations
            </span>
            {previewParts.length > 0 && (
              <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                {previewParts.join(" · ")}
              </p>
            )}
          </div>
          <ChevronDown
            className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>

        <CardContent className="space-y-5 border-t border-primary/10 pt-4">
          {(summary.profileName || summary.documentTitle) && (
            <p className="text-base text-slate-600 dark:text-slate-400">
              {summary.profileName && (
                <>
                  Profil apprenant :{" "}
                  <strong className="text-slate-900 dark:text-slate-50">{summary.profileName}</strong>
                </>
              )}
              {summary.profileName && summary.documentTitle && " · "}
              {summary.documentTitle && (
                <>
                  Document :{" "}
                  <strong className="text-slate-900 dark:text-slate-50">{summary.documentTitle}</strong>
                </>
              )}
            </p>
          )}

          <section>
            <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-50">
              Niveau d&apos;adaptation
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{summary.levelLabel}</Badge>
              <span className="text-base text-slate-700 dark:text-slate-300">
                {summary.levelDescription}
              </span>
            </div>
          </section>

          {summary.profiles.length > 0 && (
            <section>
              <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-50">
                Adaptations liées au profil pédagogique
              </h3>
              <ul className="space-y-4">
                {summary.profiles.map((profile) => (
                  <li
                    key={profile.slug}
                    className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-slate-900 dark:text-slate-50">
                        {profile.name}
                      </span>
                      <Badge variant="outline" className="text-sm">
                        {profile.categoryLabel}
                      </Badge>
                    </div>
                    <ul className="list-disc space-y-1 pl-5 text-base text-slate-700 dark:text-slate-300">
                      {profile.measures.map((measure) => (
                        <li key={measure}>{measure}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {summary.extras.length > 0 && (
            <section>
              <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-50">
                Options actives
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-base text-slate-700 dark:text-slate-300">
                {summary.extras.map((extra) => (
                  <li key={extra}>{extra}</li>
                ))}
              </ul>
            </section>
          )}
        </CardContent>
      </details>
    </Card>
  );
}
