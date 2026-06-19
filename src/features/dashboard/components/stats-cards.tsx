import { Users, Sparkles, FileText, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const STAT_CONFIG = [
  {
    key: "profilesCount" as const,
    label: "Profils",
    icon: Users,
    color: "text-primary bg-primary/10",
  },
  {
    key: "adaptationsCount" as const,
    label: "Adaptations",
    icon: Sparkles,
    color: "text-secondary bg-secondary/10",
  },
  {
    key: "documentsCount" as const,
    label: "Documents",
    icon: FileText,
    color: "text-amber-600 bg-accent/20",
  },
  {
    key: "estimatedTimeSavedMinutes" as const,
    label: "Temps économisé",
    icon: Clock,
    color: "text-emerald-600 bg-emerald-50",
    format: (v: number) => `${v} min`,
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {STAT_CONFIG.map(({ key, label, icon: Icon, color, format }) => (
        <Card key={key}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-foreground">
                {format ? format(stats[key]) : stats[key]}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
