"use client";

import { useCallback, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
} as const;

interface DocumentUploadProps {
  onUpload?: (file: File) => void;
}

export function DocumentUpload({ onUpload }: DocumentUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFile = useCallback((selected: File) => {
    setFile(selected);
    onUpload?.(selected);
  }, [onUpload]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  }

  const isValid = file
    ? Object.keys(ACCEPTED_TYPES).includes(file.type) ||
      file.name.endsWith(".docx") ||
      file.name.endsWith(".pdf") ||
      file.name.endsWith(".txt")
    : true;

  return (
    <Card>
      <CardContent className="p-6">
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
          <p className="mt-4 text-sm font-medium text-foreground">
            Glissez-déposez votre document ici
          </p>
          <p className="mt-1 text-xs text-slate-500">PDF, DOCX ou TXT — max 20 Mo</p>
          <label className="mt-4">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={handleChange}
            />
            <Button type="button" variant="outline" asChild>
              <span>Parcourir les fichiers</span>
            </Button>
          </label>
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 p-4">
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} Ko
              </p>
            </div>
            {!isValid && (
              <p className="text-xs text-red-500">Format non supporté</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
