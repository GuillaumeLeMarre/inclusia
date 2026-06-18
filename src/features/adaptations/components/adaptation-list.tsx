import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AdaptationListItem } from "@/services/adaptations.service";

interface AdaptationListProps {
  items: AdaptationListItem[];
}

export function AdaptationList({ items }: AdaptationListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Sparkles className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500">Aucune adaptation pour le moment.</p>
          <Link href="/adaptations/new" className="mt-4 text-primary text-sm underline">
            Créer votre première adaptation
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link key={item.id} href={`/adaptations/${item.id}`}>
          <Card className="hover:shadow-sm transition-shadow">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-sm text-slate-500">{item.subtitle}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.profiles.slice(0, 2).map((p) => (
                    <Badge key={p} variant="outline">{p}</Badge>
                  ))}
                </div>
              </div>
              {item.isDemo && <Badge variant="accent">Démo</Badge>}
              <span className="text-xs text-slate-400 shrink-0">{item.createdAt}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function NewAdaptationButton() {
  return (
    <Link href="/adaptations/new">
      <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
        <Plus className="h-4 w-4" />
        Nouvelle adaptation
      </span>
    </Link>
  );
}
