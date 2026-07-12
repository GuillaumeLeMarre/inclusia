"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdaptationDeleteButtonProps {
  adaptationId: string;
  adaptationTitle: string;
  redirectTo?: string;
  className?: string;
  variant?: "icon" | "button";
}

export function AdaptationDeleteButton({
  adaptationId,
  adaptationTitle,
  redirectTo = "/adaptations",
  className,
  variant = "button",
}: AdaptationDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(event?: React.MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();

    const confirmed = window.confirm(
      `Supprimer l'adaptation « ${adaptationTitle} » ? Cette action est irréversible.`,
    );

    if (!confirmed) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/adaptations/${adaptationId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Suppression échouée");
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression échouée");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("inline-flex flex-col items-end gap-1", className)}>
      {variant === "icon" ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={loading}
          aria-label={`Supprimer ${adaptationTitle}`}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      ) : (
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Supprimer
        </Button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface AdaptationRegenerateButtonProps {
  adaptationId: string;
  adaptationTitle: string;
  onRegenerated?: () => void;
  className?: string;
  variant?: "icon" | "button";
}

export function AdaptationRegenerateButton({
  adaptationId,
  adaptationTitle,
  onRegenerated,
  className,
  variant = "button",
}: AdaptationRegenerateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegenerate(event?: React.MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();

    const confirmed = window.confirm(
      `Régénérer « ${adaptationTitle} » ? Le contenu et le PDF actuels seront remplacés (mêmes paramètres).`,
    );

    if (!confirmed) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/adaptations/${adaptationId}/regenerate`, {
        method: "POST",
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = raw ? JSON.parse(raw) as { error?: string } : {};
      } catch {
        throw new Error(
          raw.trim().slice(0, 240)
          || `Erreur HTTP ${res.status} lors de la régénération`,
        );
      }
      if (!res.ok) throw new Error(data.error ?? `Régénération échouée (${res.status})`);
      onRegenerated?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Régénération échouée");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("inline-flex flex-col items-end gap-1", className)}>
      {variant === "icon" ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRegenerate}
          disabled={loading}
          aria-label={`Régénérer ${adaptationTitle}`}
          className="text-primary hover:bg-primary/10"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleRegenerate}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {loading ? "Régénération…" : "Régénérer"}
        </Button>
      )}
      {loading && (
        <p className="max-w-xs text-right text-sm text-slate-500">
          Cela peut prendre 1 à 3 minutes (IA + PDF).
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
