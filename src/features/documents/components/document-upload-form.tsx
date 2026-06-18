"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DocumentUploadFormProps {
  onSuccess?: () => void;
}

export function DocumentUploadForm({ onSuccess }: DocumentUploadFormProps) {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = file
    ? file.name.endsWith(".pdf") || file.name.endsWith(".docx") || file.name.endsWith(".txt")
    : true;

  const upload = useCallback(async (selected: File) => {
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selected);

    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload échoué");
      setFile(null);
      onSuccess?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload échoué");
    } finally {
      setLoading(false);
    }
  }, [onSuccess, router]);

  function handleFile(selected: File) {
    setFile(selected);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-slate-200",
            !isValid && "border-red-300 bg-red-50",
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <p className="mt-4 text-sm font-medium">Glissez-déposez votre document ici</p>
          <p className="mt-1 text-xs text-slate-500">PDF, DOCX ou TXT — max 20 Mo</p>
          <label className="mt-4">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleFile(selected);
              }}
            />
            <Button type="button" variant="outline" asChild disabled={loading}>
              <span>Parcourir les fichiers</span>
            </Button>
          </label>
        </div>

        {file && (
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} Ko</p>
            </div>
            <Button
              onClick={() => upload(file)}
              disabled={loading || !isValid}
              size="sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Importer"}
            </Button>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
