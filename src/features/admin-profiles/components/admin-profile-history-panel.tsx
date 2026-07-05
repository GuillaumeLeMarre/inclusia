"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { PedagogicalProfileVersion } from "@/types/pedagogical-profile";

interface AdminProfileHistoryPanelProps {
  profileId: string;
}

export function AdminProfileHistoryPanel({ profileId }: AdminProfileHistoryPanelProps) {
  const [versions, setVersions] = useState<PedagogicalProfileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/admin/profiles/versions?profileId=${profileId}`);
      const data = await res.json();
      if (!cancelled) {
        setVersions(data.versions ?? []);
        setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [profileId]);

  async function restoreVersion(version: number) {
    setRestoring(version);
    setMessage("");
    const res = await fetch("/api/admin/profiles/versions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: profileId, version }),
    });
    const data = await res.json();
    setRestoring(null);
    if (!res.ok) {
      setMessage(data.error ?? "Restauration échouée");
      return;
    }
    setMessage(`Version ${version} restaurée. Rechargez la page pour voir les changements.`);
    window.location.reload();
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Chargement de l&apos;historique…</p>;
  }

  if (versions.length === 0) {
    return <p className="text-sm text-slate-500">Aucune version enregistrée.</p>;
  }

  return (
    <div className="w-full space-y-3 overflow-x-hidden">
      {message && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p>
      )}
      <ul className="space-y-2">
        {versions.map((v) => (
          <li
            key={v.id}
            className="flex w-full flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">Version {v.version}</p>
              <p className="text-sm text-slate-500">
                {new Date(v.created_at).toLocaleString("fr-FR")}
                {v.change_note ? ` — ${v.change_note}` : ""}
              </p>
              <p className="text-xs text-slate-400">
                {v.pedagogical_objectives.length} objectifs · {v.linguistic_rules.length} règles langage
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px] w-full sm:w-auto"
              disabled={restoring === v.version}
              onClick={() => restoreVersion(v.version)}
            >
              {restoring === v.version ? "Restauration…" : "Restaurer"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
