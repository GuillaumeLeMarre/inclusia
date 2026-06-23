export type MermaidTheme = "default" | "dark";

export function getMermaidTheme(): MermaidTheme {
  if (typeof window === "undefined") return "default";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default";
}

/** Config partagée : labels SVG natifs (pas foreignObject) pour export PDF / PNG fiable. */
export function getMermaidInitializeOptions(theme: MermaidTheme = getMermaidTheme()) {
  return {
    startOnLoad: false,
    theme,
    securityLevel: "loose" as const,
    fontFamily: "Helvetica, Arial, sans-serif",
    htmlLabels: false,
    flowchart: { htmlLabels: false },
  };
}
