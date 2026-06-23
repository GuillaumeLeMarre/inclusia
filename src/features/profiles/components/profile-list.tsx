import Link from "next/link";
import { Plus, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProfileName } from "@/lib/constants/profiles";
import type { LearnerProfile } from "@/types";

interface ProfileListProps {
  profiles: LearnerProfile[];
}

export function ProfileList({ profiles }: ProfileListProps) {
  if (profiles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 text-center px-4">
          <p className="text-base text-slate-500 mb-4">Aucun profil pour le moment.</p>
          <Link href="/learners/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Créer un profil
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {profiles.map((profile) => (
          <ProfileMobileCard key={profile.id} profile={profile} />
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-base">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-foreground">Profil</th>
              <th className="px-4 py-3 font-semibold text-foreground">Niveau</th>
              <th className="px-4 py-3 font-semibold text-foreground">Adaptations</th>
              <th className="px-4 py-3 font-semibold text-foreground">Besoins</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserCircle className="h-5 w-5" aria-hidden />
                    </div>
                    <span className="font-medium">{profile.profile_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {profile.approximate_level ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {profile.adaptation_slugs.slice(0, 3).map((slug) => (
                      <Badge key={slug} variant="default">{getProfileName(slug)}</Badge>
                    ))}
                    {profile.adaptation_slugs.length > 3 && (
                      <Badge variant="outline">+{profile.adaptation_slugs.length - 3}</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                  {profile.pedagogical_needs ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProfileMobileCard({ profile }: { profile: LearnerProfile }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserCircle className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground text-base">{profile.profile_name}</p>
            <p className="text-base text-slate-500">
              {profile.approximate_level ?? "Niveau non renseigné"}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Types d&apos;adaptation</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.adaptation_slugs.map((slug) => (
              <Badge key={slug} variant="default">{getProfileName(slug)}</Badge>
            ))}
          </div>
        </div>
        {profile.pedagogical_needs && (
          <p className="text-base text-slate-600 line-clamp-3">{profile.pedagogical_needs}</p>
        )}
      </CardContent>
    </Card>
  );
}
