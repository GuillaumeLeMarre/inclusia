"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PedagogicalProfile } from "@/types/pedagogical-profile";

interface AdminProfileTestPanelProps {
  profiles: PedagogicalProfile[];
}

export function AdminProfileTestPanel({ profiles }: AdminProfileTestPanelProps) {
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "");
  const [sourceText, setSourceText] = useState(
    "La photosynthèse permet aux plantes de produire leur nourriture grâce à la lumière du soleil.",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  async function runTest() {
    setLoading(true);
    setResult("");
    const res = await fetch("/api/admin/profiles/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: profileId, source_text: sourceText }),
    });
    const data = await res.json();
    setLoading(false);
    setResult(JSON.stringify(data, null, 2));
  }

  return (
    <Card>
      <CardHeader><CardTitle>Test de prompt</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-profile">Profil</Label>
          <select
            id="test-profile"
            className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="test-text">Texte source</Label>
          <textarea
            id="test-text"
            className="min-h-[120px] w-full rounded-lg border border-slate-200 px-3 py-2 text-base"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />
        </div>
        <Button type="button" onClick={runTest} disabled={loading} className="min-h-[44px]">
          {loading ? "Exécution…" : "Tester l'IA"}
        </Button>
        {result && (
          <pre className="max-h-[400px] overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
            {result}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
