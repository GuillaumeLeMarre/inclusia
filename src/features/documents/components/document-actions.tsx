"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Eye, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocumentDeleteButtonProps {
  documentId: string;
  documentTitle: string;
  adaptationsCount?: number;
  redirectTo?: string;
  className?: string;
  variant?: "icon" | "button";
}

export function DocumentDeleteButton({
  documentId,
  documentTitle,
  adaptationsCount = 0,
  redirectTo = "/documents",
  className,
  variant = "button",
}: DocumentDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const adaptationsWarning =
      adaptationsCount > 0
        ? `\n\n${adaptationsCount} adaptation${adaptationsCount > 1 ? "s" : ""} liée${adaptationsCount > 1 ? "s" : ""} sera${adaptationsCount > 1 ? "ont" : ""} également supprimée${adaptationsCount > 1 ? "s" : ""}.`
        : "";

    const confirmed = window.confirm(
      `Supprimer « ${documentTitle} » ? Cette action est irréversible.${adaptationsWarning}`,
    );

    if (!confirmed) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
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
          aria-label={`Supprimer ${documentTitle}`}
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

interface DocumentViewLinkProps {
  documentId: string;
  documentTitle: string;
  className?: string;
  variant?: "icon" | "button";
}

export function DocumentViewLink({
  documentId,
  documentTitle,
  className,
  variant = "button",
}: DocumentViewLinkProps) {
  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        asChild
        aria-label={`Consulter ${documentTitle}`}
        className={className}
      >
        <Link href={`/documents/${documentId}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button variant="outline" asChild className={cn("w-full sm:w-auto", className)}>
      <Link href={`/documents/${documentId}`}>
        <Eye className="h-4 w-4" />
        Consulter
      </Link>
    </Button>
  );
}

interface DocumentRowActionsProps {
  documentId: string;
  documentTitle: string;
}

export function DocumentRowActions({ documentId, documentTitle }: DocumentRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <DocumentViewLink documentId={documentId} documentTitle={documentTitle} variant="icon" />
      <DocumentDeleteButton
        documentId={documentId}
        documentTitle={documentTitle}
        variant="icon"
      />
    </div>
  );
}
