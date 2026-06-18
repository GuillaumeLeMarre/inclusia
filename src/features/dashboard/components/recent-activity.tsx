import { Sparkles, FileText, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { RecentActivity } from "@/types";

interface RecentActivityListProps {
  activities: RecentActivity[];
}

const ICONS = {
  adaptation: Sparkles,
  document: FileText,
  student: Users,
};

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune activité récente.</p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => {
              const Icon = ICONS[activity.type];
              return (
                <li key={activity.id} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-slate-500 truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {formatDate(activity.created_at)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
