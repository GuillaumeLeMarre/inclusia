"use client";

import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SchemaImageCardProps {
  alt?: string;
  onOpenSchema?: () => void;
  className?: string;
}

export function SchemaImageCard({ alt, onOpenSchema, className }: SchemaImageCardProps) {
  return (
    <figure
      className={cn(
        "my-4 rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-6 w-6 shrink-0 text-primary" aria-hidden />
          <div>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Schéma disponible
            </div>
            {alt && (
              <figcaption className="text-sm text-slate-600 dark:text-slate-400">
                {alt}
              </figcaption>
            )}
          </div>
        </div>
        {onOpenSchema && (
          <Button type="button" variant="outline" className="min-h-[44px]" onClick={onOpenSchema}>
            Ouvrir le schéma
          </Button>
        )}
      </div>
    </figure>
  );
}
