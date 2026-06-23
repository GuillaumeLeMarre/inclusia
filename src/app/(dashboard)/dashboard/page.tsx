import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
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
          <Link href="/adaptations/new" className="block w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Sparkles className="h-4 w-4" />
              Nouvelle adaptation
            </Button>
          </Link>
        }
      />
      <PageContainer className="space-y-6 md:space-y-8">
        <StatsCards stats={stats} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <RecentActivityList activities={activity} />
          <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-2">Démarrage rapide</h3>
            <p className="text-base text-slate-500 mb-6">
              Adaptez un cours en 3 étapes simples
            </p>
            <ol className="space-y-4">
              {[
                { step: 1, label: "Créer un profil apprenant", href: "/learners/new" },
                { step: 2, label: "Importer un document", href: "/documents" },
                { step: 3, label: "Lancer une adaptation", href: "/adaptations/new" },
              ].map(({ step, label, href }) => (
                <li key={step} className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                    {step}
                  </span>
                  <Link href={href} className="text-base font-medium text-primary hover:underline min-h-[44px] flex items-center">
                    {label}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
