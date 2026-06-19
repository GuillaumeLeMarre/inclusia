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
  profile: Users,
};

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-base text-slate-500">Aucune activité récente.</p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => {
              const Icon = ICONS[activity.type];
              return (
                <li key={activity.id} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Icon className="h-5 w-5 text-slate-600" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium text-foreground">{activity.title}</p>
                      <p className="text-base text-slate-500 break-words">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-base text-slate-500 sm:text-slate-400 shrink-0 pl-13 sm:pl-0">
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
