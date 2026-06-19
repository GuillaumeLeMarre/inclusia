"use client";

import { Badge } from "@/components/ui/badge";
import { getFalcScoreEmoji } from "@/lib/falc/falc-score-label";
import type { FalcQualityLabel } from "@/types/falc";

interface FalcScoreBadgeProps {
  score: number;
  label?: FalcQualityLabel;
}

export function FalcScoreBadge({ score, label }: FalcScoreBadgeProps) {
  const emoji = getFalcScoreEmoji(score);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="accent" className="text-base px-3 py-1">
        FALC
      </Badge>
      <span className="text-base font-medium text-slate-700 dark:text-slate-200">
        {emoji} Score FALC : {score}/100
        {label ? ` — ${label}` : ""}
      </span>
    </div>
  );
}
