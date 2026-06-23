"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Plus, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PedagogicalProfile, TeacherProfile } from "@/types/pedagogical-profile";

interface PedagogicalProfilesViewProps {
  systemProfiles: PedagogicalProfile[];
  myProfiles: TeacherProfile[];
}

export function PedagogicalProfilesView({
  systemProfiles,
  myProfiles,
}: PedagogicalProfilesViewProps) {
  const [duplicating, setDuplicating] = useState<string | null>(null);

  async function duplicateSystem(sourceProfileId: string, name: string) {
    setDuplicating(sourceProfileId);
    try {
      const res = await fetch("/api/profiles/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_profile_id: sourceProfileId, name }),
      });
      if (!res.ok) throw new Error("Duplication échouée");
      window.location.reload();
    } finally {
      setDuplicating(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Profils système</h2>
          <p className="text-base text-slate-600">
            Profils pédagogiques gérés par l&apos;administration. Dupliquez-les pour les personnaliser.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {systemProfiles.map((profile) => (
            <Card key={profile.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{profile.name}</CardTitle>
                <Badge variant="secondary">{profile.category}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-3 text-sm text-slate-600">{profile.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[44px]"
                    disabled={duplicating === profile.id || profile.id.startsWith("fallback:")}
                    onClick={() => duplicateSystem(profile.id, `${profile.name} — perso`)}
                  >
                    <Copy className="h-4 w-4" />
                    Dupliquer
                  </Button>
                  <Link href={`/adaptations/new?pedagogicalProfileSlug=${profile.slug}`}>
                    <Button size="sm" className="min-h-[44px]">Utiliser</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Mes profils</h2>
            <p className="text-base text-slate-600">Vos profils pédagogiques personnalisés.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/profiles/new">
              <Button className="min-h-[44px]"><Plus className="h-4 w-4" />Créer</Button>
            </Link>
            <a href="/api/profiles/export">
              <Button variant="outline" className="min-h-[44px]">Exporter</Button>
            </a>
          </div>
        </div>

        {myProfiles.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-500">
              Aucun profil personnel. Dupliquez un profil système ou créez le vôtre.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {myProfiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{profile.name}</CardTitle>
                  {!profile.is_active && <Badge variant="outline">Inactif</Badge>}
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Link href={`/profiles/${profile.id}`}>
                    <Button size="sm" variant="outline" className="min-h-[44px]">
                      <Settings2 className="h-4 w-4" />Modifier
                    </Button>
                  </Link>
                  <Link href={`/adaptations/new?teacherProfileId=${profile.id}`}>
                    <Button size="sm" className="min-h-[44px]">Utiliser</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
