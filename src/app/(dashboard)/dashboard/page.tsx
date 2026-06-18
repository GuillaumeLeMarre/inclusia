import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/features/dashboard/components/stats-cards";
import { RecentActivityList } from "@/features/dashboard/components/recent-activity";
import { getDashboardStats, getRecentActivity } from "@/services/dashboard.service";

export default async function DashboardPage() {
  const [stats, activity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
  ]);

  return (
    <>
      <AppHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre activité pédagogique"
        action={
          <Link href="/adaptations/new">
            <Button>
              <Sparkles className="h-4 w-4" />
              Nouvelle adaptation
            </Button>
          </Link>
        }
      />
      <div className="p-8 space-y-8">
        <StatsCards stats={stats} />
        <div className="grid gap-8 lg:grid-cols-2">
          <RecentActivityList activities={activity} />
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold mb-2">Démarrage rapide</h3>
            <p className="text-sm text-slate-500 mb-6">
              Adaptez un cours en 3 étapes simples
            </p>
            <ol className="space-y-4">
              {[
                { step: 1, label: "Créer un élève", href: "/students/new" },
                { step: 2, label: "Importer un document", href: "/documents" },
                { step: 3, label: "Lancer une adaptation", href: "/adaptations/new" },
              ].map(({ step, label, href }) => (
                <li key={step} className="flex items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {step}
                  </span>
                  <Link href={href} className="text-sm font-medium text-primary hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
