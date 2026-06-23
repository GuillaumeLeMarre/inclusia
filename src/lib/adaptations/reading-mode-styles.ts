import type { ReadingMode } from "@/types/reading-mode";
import { cn } from "@/lib/utils";

export function getAdaptationContainerClasses(mode: ReadingMode): string {
  const base = "w-full break-words adaptation-content";

  switch (mode) {
    case "dyslexia":
      return cn(
        base,
        "font-opendyslexic text-lg leading-8 max-w-4xl tracking-wide",
      );
    case "tdah":
      return cn(
        base,
        "text-lg leading-relaxed max-w-3xl",
        "[&_p]:mb-6 [&_li]:mb-3",
      );
    case "high-contrast":
      return cn(
        base,
        "text-lg leading-8 max-w-4xl rounded-lg bg-white p-4 text-black",
        "dark:bg-black dark:text-white",
        "[&_a]:underline [&_strong]:text-black dark:[&_strong]:text-white",
      );
    case "falc":
      return cn(
        base,
        "text-lg leading-9 max-w-3xl tracking-wide",
        "rounded-lg bg-white p-4 text-slate-900",
        "dark:bg-slate-950 dark:text-slate-50",
        "[&_strong]:text-primary",
      );
    default:
      return cn(base, "text-base leading-7 max-w-4xl");
  }
}

export function getFirstCourseTitleClasses(mode: ReadingMode): string {
  const dys = mode === "dyslexia" || mode === "high-contrast" || mode === "falc";
  const size = dys ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl";
  const contrast =
    mode === "high-contrast"
      ? "text-black dark:text-white decoration-black dark:decoration-white"
      : "text-slate-900 dark:text-slate-50 decoration-slate-900 dark:decoration-slate-50";

  return cn(
    "font-bold text-center mb-6 mt-0",
    size,
    contrast,
    "[&_strong]:font-bold [&_strong]:!text-inherit",
  );
}

export function getHeadingClasses(
  mode: ReadingMode,
  level: 1 | 2 | 3,
  isFirstCourseHeading = false,
): string {
  if (isFirstCourseHeading) return getFirstCourseTitleClasses(mode);

  const dys = mode === "dyslexia" || mode === "high-contrast" || mode === "falc";
  const sizes = {
    1: dys ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
    2: dys ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
    3: dys ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
  };

  const contrast =
    mode === "high-contrast"
      ? "text-black dark:text-white border-b-2 border-black dark:border-white pb-2"
      : "text-slate-900 dark:text-slate-50";

  return cn(
    "font-bold mt-8 mb-4 first:mt-0",
    sizes[level],
    contrast,
  );
}

export function getParagraphClasses(mode: ReadingMode): string {
  return cn(
    "mb-4 last:mb-0",
    mode === "high-contrast"
      ? "text-black dark:text-white"
      : "text-slate-700 dark:text-slate-300",
    (mode === "dyslexia" || mode === "tdah" || mode === "falc") && "text-lg leading-8",
  );
}

export function getStrongClasses(mode: ReadingMode): string {
  if (mode === "high-contrast") {
    return "font-bold text-black underline decoration-2 dark:text-white";
  }
  return "font-bold text-primary";
}
