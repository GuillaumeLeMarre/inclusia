import { Coins, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatAiCostEur, formatTokenCount } from "@/lib/ai/format-ai-usage";
import type { DashboardStats } from "@/types";

interface AiUsageStatsCardProps {
  stats: Pick<DashboardStats, "aiTokensUsed" | "aiEstimatedCostEur">;
}

export function AiUsageStatsCard({ stats }: AiUsageStatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Consommation IA</h3>
            <p className="text-base text-slate-500">
              Tokens OpenAI utilisés et coût estimé sur votre compte
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Coins className="h-4 w-4" aria-hidden />
              <p className="text-sm font-medium">Tokens consommés</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatTokenCount(stats.aiTokensUsed)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {new Intl.NumberFormat("fr-FR").format(stats.aiTokensUsed)} tokens au total
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <span className="text-sm font-semibold" aria-hidden>€</span>
              <p className="text-sm font-medium">Coût estimé</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatAiCostEur(stats.aiEstimatedCostEur)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Estimation basée sur le tarif du modèle OpenAI configuré
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
