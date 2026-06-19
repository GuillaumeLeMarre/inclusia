"use client";

import { Label } from "@/components/ui/label";
import { useReadingMode } from "@/hooks/use-reading-mode";
import { READING_MODE_OPTIONS, type ReadingMode } from "@/types/reading-mode";
import { cn } from "@/lib/utils";

export function ReadingModeSettings() {
  const { mode, setMode } = useReadingMode();

  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Mode lecture</legend>
      <p className="text-base text-slate-600 dark:text-slate-400">
        Choisissez l&apos;affichage des résumés et cours adaptés.
      </p>
      <div className="grid gap-2">
        {READING_MODE_OPTIONS.map((option) => {
          const selected = mode === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
              )}
            >
              <input
                type="radio"
                name="reading-mode"
                value={option.value}
                checked={selected}
                onChange={() => setMode(option.value as ReadingMode)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span className="space-y-1">
                <Label className="cursor-pointer text-base font-semibold">{option.label}</Label>
                <span className="block text-sm text-slate-600 dark:text-slate-400">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
