"use client";

import type { ProfileOptions } from "@/types/pedagogical-profile";
import type { AdaptationLevel } from "@/types/adaptation-level";

const ITEMS: {
  key: keyof ProfileOptions;
  label: string;
  hint: string;
}[] = [
  { key: "generate_summary", label: "Résumé", hint: "Synthèse du cours adapté" },
  { key: "generate_quiz", label: "Quiz", hint: "Questions de compréhension" },
  { key: "generate_mindmap", label: "Schéma", hint: "Carte mentale ou frise" },
  { key: "generate_audio", label: "Audio", hint: "Script pour lecture audio" },
  { key: "generate_falc", label: "Version FALC", hint: "Texte en FALC en complément" },
];

interface AdaptationProductionOptionsProps {
  value: ProfileOptions;
  onChange: (options: ProfileOptions) => void;
  adaptationLevel: AdaptationLevel;
}

export function AdaptationProductionOptions({
  value,
  onChange,
  adaptationLevel,
}: AdaptationProductionOptionsProps) {
  const falcForced = adaptationLevel === "falc";

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-700">Contenus à générer</legend>
      {ITEMS.map(({ key, label, hint }) => {
        const disabled = falcForced && key === "generate_falc";
        const checked = falcForced && key === "generate_falc" ? true : value[key];

        return (
          <label
            key={key}
            className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 ${
              disabled ? "bg-slate-50 opacity-80" : ""
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-primary"
              checked={checked}
              disabled={disabled}
              onChange={(e) => onChange({ ...value, [key]: e.target.checked })}
            />
            <span className="text-base text-slate-700">
              {label}
              <span className="block text-sm text-slate-500">{hint}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
