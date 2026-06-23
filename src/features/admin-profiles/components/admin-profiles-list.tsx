"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PedagogicalProfile } from "@/types/pedagogical-profile";

const CATEGORIES = [
  { value: "", label: "Toutes" },
  { value: "learning", label: "Apprentissage" },
  { value: "motor", label: "Moteur" },
  { value: "language", label: "Langage" },
  { value: "attention", label: "Attention" },
  { value: "social", label: "Social" },
  { value: "sensory", label: "Sensoriel" },
  { value: "accessibility", label: "Accessibilité" },
];

interface AdminProfilesListProps {
  profiles: PedagogicalProfile[];
}

export function AdminProfilesList({ profiles }: AdminProfilesListProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return profiles.filter((p) => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.slug.includes(q);
    });
  }, [profiles, search, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9 min-h-[44px]"
            placeholder="Rechercher un profil…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="min-h-[44px] rounded-lg border border-slate-200 px-3 text-base"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <Link href="/admin/profiles/new">
          <Button className="min-h-[44px] w-full sm:w-auto"><Plus className="h-4 w-4" />Créer</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-base">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Catégorie</th>
              <th className="px-4 py-3 font-semibold">État</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((profile) => (
              <tr key={profile.id} className="border-b last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium">{profile.name}</td>
                <td className="px-4 py-3 text-slate-600">{profile.slug}</td>
                <td className="px-4 py-3"><Badge variant="secondary">{profile.category}</Badge></td>
                <td className="px-4 py-3">
                  <Badge variant={profile.is_active ? "default" : "outline"}>
                    {profile.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/profiles/${profile.id}`} className="text-primary underline">
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <Card><CardContent className="py-8 text-center text-slate-500">Aucun profil trouvé.</CardContent></Card>
      )}
    </div>
  );
}
