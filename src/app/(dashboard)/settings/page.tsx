import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAppConfig } from "@/lib/config";

export default function SettingsPage() {
  const { isDemoMode, isSupabaseConfigured } = getAppConfig();

  return (
    <>
      <AppHeader
        title="Paramètres"
        description="Configuration de votre espace Inclusia"
      />
      <PageContainer className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-base">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-600">Mode démo</span>
              <Badge variant={isDemoMode ? "accent" : "success"}>
                {isDemoMode ? "Activé" : "Désactivé"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-600">Supabase</span>
              <Badge variant={isSupabaseConfigured ? "success" : "outline"}>
                {isSupabaseConfigured ? "Connecté" : "Non configuré"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Accessibilité</CardTitle>
          </CardHeader>
          <CardContent className="text-base text-slate-600">
            L&apos;interface respecte une taille de texte minimale de 16px et des zones tactiles
            d&apos;au moins 44×44 px pour une utilisation confortable sur mobile.
          </CardContent>
        </Card>
      </PageContainer>
    </>
  );
}
