import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AdaptationListItem } from "@/services/adaptations.service";

interface AdaptationListProps {
  items: AdaptationListItem[];
}

export function AdaptationList({ items }: AdaptationListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 text-center px-4">
          <Sparkles className="h-12 w-12 text-slate-300 mb-4" aria-hidden />
          <p className="text-base text-slate-500">Aucune adaptation pour le moment.</p>
          <Link href="/adaptations/new" className="mt-4 w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Créer votre première adaptation</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link key={item.id} href={`/adaptations/${item.id}`} className="block">
          <Card className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
              <div className="flex items-start gap-3 sm:items-center sm:flex-1 sm:min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-base truncate">{item.title}</p>
                  <p className="text-base text-slate-500">{item.subtitle}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.profiles.slice(0, 3).map((p) => (
                      <Badge key={p} variant="outline">{p}</Badge>
                    ))}
                    {item.profiles.length > 3 && (
                      <Badge variant="outline">+{item.profiles.length - 3}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end sm:shrink-0">
                {item.isDemo && <Badge variant="accent">Démo</Badge>}
                <span className="text-base text-slate-400">{item.createdAt}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function NewAdaptationButton() {
  return (
    <Link href="/adaptations/new" className="block w-full sm:w-auto">
      <Button className="w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        Nouvelle adaptation
      </Button>
    </Link>
  );
}
