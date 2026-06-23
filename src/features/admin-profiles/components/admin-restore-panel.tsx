"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminRestorePanelProps {
  initialStatus: {
    databaseCount: number;
    fallbackCount: number;
    inSync: boolean;
  };
}

export function AdminRestorePanel({ initialStatus }: AdminRestorePanelProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function restore() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/profiles/restore", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setStatus(data.status);
      setMessage(
        `Restauration : ${data.result.created} créés, ${data.result.updated} mis à jour, ${data.result.skipped} inchangés.`,
      );
    } else {
      setMessage("Erreur de restauration");
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Système — fallback JSON</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <ul className="text-base text-slate-600">
          <li>Profils en base : {status.databaseCount}</li>
          <li>Profils fallback : {status.fallbackCount}</li>
          <li>État : {status.inSync ? "Synchronisé" : "Restauration recommandée"}</li>
        </ul>
        <p className="text-sm text-slate-500">
          Recharge les profils système depuis le JSON. Ne supprime jamais les profils enseignants.
        </p>
        <Button type="button" onClick={restore} disabled={loading} className="min-h-[44px]">
          {loading ? "Restauration…" : "Restaurer les profils système"}
        </Button>
        {message && <p className="text-base text-slate-700">{message}</p>}
      </CardContent>
    </Card>
  );
}
