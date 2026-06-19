"use client";

import { ADAPTATION_LEVELS, type AdaptationLevel } from "@/types/adaptation-level";
import { cn } from "@/lib/utils";

interface AdaptationLevelSelectorProps {
  value: AdaptationLevel;
  onChange: (level: AdaptationLevel) => void;
}

export function AdaptationLevelSelector({ value, onChange }: AdaptationLevelSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-semibold text-slate-900 dark:text-slate-50">
        Niveau d&apos;adaptation
      </legend>
      <div className="grid gap-2">
        {ADAPTATION_LEVELS.map((level) => (
          <label
            key={level.value}
            className={cn(
              "flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
              value === level.value
                ? "border-primary bg-primary/5"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
            )}
          >
            <input
              type="radio"
              name="adaptation-level"
              value={level.value}
              checked={value === level.value}
              onChange={() => onChange(level.value)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span>
              <span className="block text-base font-semibold">{level.label}</span>
              <span className="block text-sm text-slate-600 dark:text-slate-400">
                {level.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
