"use client";

import { useCallback, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  MAX_PROFILE_RULE_LENGTH,
  MAX_PROFILE_RULES,
} from "@/schemas/profile-rules.schema";

export interface ProfileRuleListEditorProps {
  title: string;
  description: string;
  value: string[];
  onChange: (rules: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  maxLength?: number;
  previousValue?: string[];
  suggestions?: readonly string[];
}

const SELECT_CLASS =
  "min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50";

const ICON_BTN =
  "h-9 w-9 min-h-0 min-w-0 shrink-0 p-0 text-slate-500 hover:text-slate-800";

function normalizeKey(text: string): string {
  return text.trim().toLowerCase();
}

function isInSuggestions(suggestions: readonly string[], text: string): boolean {
  const key = normalizeKey(text);
  return suggestions.some((s) => normalizeKey(s) === key);
}

function optionsForRow(
  suggestions: readonly string[],
  value: string[],
  index: number,
): string[] {
  const current = value[index]?.trim() ?? "";
  const usedElsewhere = new Set(
    value
      .map((v, i) => (i === index ? null : normalizeKey(v)))
      .filter(Boolean) as string[],
  );

  const fromList = suggestions.filter((s) => !usedElsewhere.has(normalizeKey(s)));

  if (current && !isInSuggestions(suggestions, current)) {
    return [current, ...fromList];
  }

  if (current && !fromList.some((s) => normalizeKey(s) === normalizeKey(current))) {
    return [current, ...fromList];
  }

  return fromList;
}

function availableToAdd(suggestions: readonly string[], value: string[]): string[] {
  const used = new Set(value.map(normalizeKey));
  return suggestions.filter((s) => !used.has(normalizeKey(s)));
}

interface RuleSelectProps {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  suggestions: readonly string[];
  onChange: (value: string) => void;
}

function RuleSelect({ id, label, value, options, suggestions, onChange }: RuleSelectProps) {
  return (
    <>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <select
        id={id}
        className={SELECT_CLASS}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
            {!isInSuggestions(suggestions, option) ? " (personnalisé)" : ""}
          </option>
        ))}
      </select>
    </>
  );
}

export function ProfileRuleListEditor({
  title,
  description,
  value,
  onChange,
  placeholder = "Saisir une règle…",
  maxItems = MAX_PROFILE_RULES,
  maxLength = MAX_PROFILE_RULE_LENGTH,
  previousValue,
  suggestions,
}: ProfileRuleListEditorProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const selectorMode = Boolean(suggestions?.length);
  const canAdd = value.length < maxItems;

  const validateRule = useCallback(
    (text: string, excludeIndex?: number): string | null => {
      const trimmed = text.trim();
      if (!trimmed) return "Règle vide";
      if (trimmed.length > maxLength) {
        return `Maximum ${maxLength} caractères`;
      }
      if (
        value.some(
          (r, i) =>
            i !== excludeIndex && normalizeKey(r) === normalizeKey(trimmed),
        )
      ) {
        return "Règle déjà présente";
      }
      return null;
    },
    [maxLength, value],
  );

  function addRule(text: string) {
    const validation = validateRule(text);
    if (validation) {
      setError(validation);
      return;
    }
    onChange([...value, text.trim()]);
    setError("");
  }

  function updateRule(index: number, text: string) {
    const validation = validateRule(text, index);
    if (validation) {
      setError(validation);
      return;
    }
    const next = [...value];
    next[index] = text.trim();
    onChange(next);
    setError("");
  }

  function removeRule(index: number) {
    onChange(value.filter((_, i) => i !== index));
    setError("");
  }

  function moveRule(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  function restorePrevious() {
    if (previousValue) onChange([...previousValue]);
  }

  const addOptions = suggestions ? availableToAdd(suggestions, value) : [];

  return (
    <section className="w-full overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {value.length}/{maxItems}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>

      {selectorMode && suggestions ? (
        <>
          {value.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              Aucun objectif configuré.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {value.map((rule, index) => (
                <li
                  key={`${index}-${rule.slice(0, 12)}`}
                  className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-500"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>

                  <RuleSelect
                    id={`${title}-rule-${index}`}
                    label={`${title} — objectif ${index + 1}`}
                    value={rule}
                    options={optionsForRow(suggestions, value, index)}
                    suggestions={suggestions}
                    onChange={(text) => updateRule(index, text)}
                  />

                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(ICON_BTN, index === 0 && "opacity-30")}
                      disabled={index === 0}
                      onClick={() => moveRule(index, -1)}
                      aria-label="Monter"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(ICON_BTN, index === value.length - 1 && "opacity-30")}
                      disabled={index === value.length - 1}
                      onClick={() => moveRule(index, 1)}
                      aria-label="Descendre"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(ICON_BTN, "hover:bg-red-50 hover:text-red-600")}
                      onClick={() => removeRule(index)}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
            <Label htmlFor={`add-${title}`} className="text-sm text-slate-600">
              Ajouter un objectif
            </Label>
            <select
              id={`add-${title}`}
              className={SELECT_CLASS}
              disabled={!canAdd || addOptions.length === 0}
              defaultValue=""
              onChange={(e) => {
                const picked = e.target.value;
                if (!picked) return;
                addRule(picked);
                e.target.value = "";
              }}
            >
              <option value="">
                {canAdd
                  ? addOptions.length > 0
                    ? "Choisir un objectif…"
                    : "Tous les objectifs sont déjà ajoutés"
                  : `Maximum ${maxItems} objectifs atteint`}
              </option>
              {addOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </>
      ) : (
        <>
          {value.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              Aucune règle pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {value.map((rule, index) => (
                <li
                  key={`${index}-${rule.slice(0, 12)}`}
                  className="flex items-start gap-2 px-3 py-2 sm:gap-3 sm:px-4"
                >
                  <span
                    className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-500"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <textarea
                    rows={1}
                    className="w-full flex-1 resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-base leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    value={rule}
                    maxLength={maxLength}
                    aria-label={`${title} — règle ${index + 1}`}
                    onChange={(e) => updateRule(index, e.target.value)}
                  />
                  <div className="mt-0.5 flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(ICON_BTN, index === 0 && "opacity-30")}
                      disabled={index === 0}
                      onClick={() => moveRule(index, -1)}
                      aria-label="Monter"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(ICON_BTN, index === value.length - 1 && "opacity-30")}
                      disabled={index === value.length - 1}
                      onClick={() => moveRule(index, 1)}
                      aria-label="Descendre"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(ICON_BTN, "hover:bg-red-50 hover:text-red-600")}
                      onClick={() => removeRule(index)}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
            <Label htmlFor={`add-${title}`} className="sr-only">
              Ajouter une règle — {title}
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                id={`add-${title}`}
                value={draft}
                placeholder={placeholder}
                maxLength={maxLength}
                className="min-h-[40px] w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                onChange={(e) => {
                  setDraft(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRule(draft);
                    setDraft("");
                  }
                }}
              />
              <Button
                type="button"
                className="min-h-[40px] shrink-0 sm:px-4"
                disabled={!canAdd}
                onClick={() => {
                  addRule(draft);
                  setDraft("");
                }}
              >
                Ajouter
              </Button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!canAdd && (
              <p className="text-sm text-amber-700">Maximum {maxItems} règles atteint.</p>
            )}
          </div>
        </>
      )}

      {previousValue && previousValue.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-[36px] px-2 text-sm text-slate-600"
            onClick={restorePrevious}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurer la version précédente
          </Button>
        </div>
      )}
    </section>
  );
}
