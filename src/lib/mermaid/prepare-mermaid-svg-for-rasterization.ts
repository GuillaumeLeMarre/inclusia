import { centerMindmapRootNodeLabels } from "@/lib/mermaid/center-mindmap-root-label";

function parseLength(value: string | null | undefined, fallback = 0): number {
  if (!value) return fallback;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function extractVisibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTextColor(html: string): string | null {
  const match = html.match(/color:\s*(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|[a-zA-Z]+)/i);
  return match?.[1] ?? null;
}

interface CssFillRule {
  selector: string;
  fill: string;
}

function parseCssFillRules(styleContent: string): CssFillRule[] {
  const rules: CssFillRule[] = [];
  const ruleRegex = /([^{]+)\{([^}]*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = ruleRegex.exec(styleContent)) !== null) {
    const selector = match[1]!.trim();
    const body = match[2]!;
    const fillMatch = body.match(/fill:\s*([^;!]+)/i);
    const colorMatch = body.match(/(?:^|[;\s])color:\s*([^;!]+)/i);
    const fill = (fillMatch?.[1] ?? colorMatch?.[1])?.trim();
    if (
      fill
      && (selector.includes("text") || selector.includes("tspan") || selector.includes("span"))
    ) {
      rules.push({ selector, fill });
    }
  }

  return rules;
}

function collectStyleFillRules(root: Element): CssFillRule[] {
  const rules: CssFillRule[] = [];
  root.querySelectorAll("style").forEach((styleEl) => {
    rules.push(...parseCssFillRules(styleEl.textContent ?? ""));
  });
  return rules;
}

function getSectionClass(element: Element): string | null {
  let current: Element | null = element;
  while (current) {
    const match = (current.getAttribute("class") ?? "").match(/\bsection-(?:root|\d+)\b/);
    if (match) return match[0]!;
    current = current.parentElement;
  }
  return null;
}

function getLook(element: Element): string | null {
  let current: Element | null = element;
  while (current) {
    const look = current.getAttribute("data-look");
    if (look) return look;
    current = current.parentElement;
  }
  return null;
}

function hasMindmapNodeAncestor(element: Element): boolean {
  let current: Element | null = element;
  while (current) {
    if ((current.getAttribute("class") ?? "").includes("mindmap-node")) return true;
    current = current.parentElement;
  }
  return false;
}

function scoreFillRule(element: Element, rule: CssFillRule): number {
  const tag = element.tagName.toLowerCase();
  const selector = rule.selector;
  const classes = (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
  const section = getSectionClass(element);
  const look = getLook(element);

  if (tag === "text" || tag === "tspan") {
    if (!selector.includes("text") && !selector.includes("tspan")) return 0;
  }

  let score = 0;
  if (classes.includes("text-inner-tspan") && selector.includes("text-inner-tspan")) score += 12;
  if (section && selector.includes(section)) score += 8;
  if (look && selector.includes(`[data-look="${look}"]`)) score += 6;
  if (selector.includes("mindmap-node") && hasMindmapNodeAncestor(element)) score += 4;
  if (selector.includes("section-root") && section === "section-root") score += 6;
  if (tag === "text" && selector.includes(" text")) score += 2;
  if (tag === "tspan" && selector.includes("tspan")) score += 2;
  return score;
}

function resolveFillFromCssRules(element: Element, rules: CssFillRule[]): string | null {
  let best: { fill: string; score: number } | null = null;

  for (const rule of rules) {
    const score = scoreFillRule(element, rule);
    if (score <= 0) continue;
    if (!best || score > best.score) best = { fill: rule.fill, score };
  }

  return best?.fill ?? null;
}

function defaultFillForElement(element: Element): string {
  return getSectionClass(element) === "section-root" ? "#ffffff" : "#1e293b";
}

function createSvgTextElement(
  doc: Document,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string | null,
): SVGTextElement {
  const textEl = doc.createElementNS("http://www.w3.org/2000/svg", "text");
  textEl.textContent = text;
  textEl.setAttribute("x", String(x + width / 2));
  textEl.setAttribute("y", String(y + height / 2));
  textEl.setAttribute("text-anchor", "middle");
  textEl.setAttribute("dominant-baseline", "middle");
  textEl.setAttribute("font-family", "Helvetica, Arial, sans-serif");
  textEl.setAttribute("font-size", "14");
  textEl.setAttribute("fill", fill ?? defaultFillForElement(textEl));
  return textEl;
}

function inlineTextStyles(root: Element, cssRules: CssFillRule[]): void {
  root.querySelectorAll("text, tspan").forEach((node) => {
    const element = node as SVGTextElement | SVGTSpanElement;
    const inlineFill = element.getAttribute("fill");
    const inlineStyle = element.getAttribute("style") ?? "";
    const styleFill = inlineStyle.match(/fill:\s*([^;]+)/i)?.[1]?.trim();

    if (!inlineFill && !styleFill) {
      const resolved = resolveFillFromCssRules(element, cssRules) ?? defaultFillForElement(element);
      element.setAttribute("fill", resolved);
    } else if (!inlineFill && styleFill) {
      element.setAttribute("fill", styleFill);
    }

    if (!element.getAttribute("font-family")) {
      element.setAttribute("font-family", "Helvetica, Arial, sans-serif");
    }
    if (!element.getAttribute("font-size")) {
      element.setAttribute("font-size", "14");
    }
  });
}

function applyLiveComputedTextStyles(root: Element, liveSvg: SVGSVGElement): void {
  const liveNodes = liveSvg.querySelectorAll("text, tspan");
  const preparedNodes = root.querySelectorAll("text, tspan");

  preparedNodes.forEach((node, index) => {
    const liveNode = liveNodes[index];
    if (!(liveNode instanceof SVGTextElement || liveNode instanceof SVGTSpanElement)) return;
    if (!(node instanceof SVGTextElement || node instanceof SVGTSpanElement)) return;

    const computed = window.getComputedStyle(liveNode);
    const fill = computed.fill;
    if (fill && fill !== "none" && fill !== "rgba(0, 0, 0, 0)") {
      node.setAttribute("fill", fill);
    }
    if (computed.fontSize) node.setAttribute("font-size", computed.fontSize);
    if (computed.fontFamily) node.setAttribute("font-family", computed.fontFamily);
    if (computed.fontWeight && computed.fontWeight !== "normal") {
      node.setAttribute("font-weight", computed.fontWeight);
    }
    if (!node.textContent?.trim() && liveNode.textContent?.trim()) {
      node.textContent = liveNode.textContent.trim();
    }
  });
}

function replaceForeignObjects(root: Element, cssRules: CssFillRule[]): void {
  root.querySelectorAll("foreignObject").forEach((fo) => {
    const html = fo.innerHTML;
    const text = extractVisibleText(html);
    if (!text) {
      fo.remove();
      return;
    }

    const x = parseLength(fo.getAttribute("x"));
    const y = parseLength(fo.getAttribute("y"));
    const width = parseLength(fo.getAttribute("width"));
    const height = parseLength(fo.getAttribute("height"));
    const color = extractTextColor(html)
      ?? resolveFillFromCssRules(fo, cssRules)
      ?? defaultFillForElement(fo);

    fo.replaceWith(createSvgTextElement(root.ownerDocument!, text, x, y, width, height, color));
  });
}

function prepareSvgRoot(root: Element, liveSvg?: SVGSVGElement | null): string {
  const cssRules = collectStyleFillRules(root);
  replaceForeignObjects(root, cssRules);

  if (liveSvg && typeof window !== "undefined") {
    applyLiveComputedTextStyles(root, liveSvg);
  } else {
    inlineTextStyles(root, cssRules);
  }

  if (root instanceof SVGSVGElement) {
    centerMindmapRootNodeLabels(root);
  }

  return new XMLSerializer().serializeToString(root);
}

function inlineTextFillsRegex(svg: string, cssRules: CssFillRule[]): string {
  const sectionTextFills = new Map<string, string>();
  const sectionTspanFills = new Map<string, string>();

  for (const rule of cssRules) {
    const section = rule.selector.match(/section-(?:root|\d+)/)?.[0];
    if (!section) continue;
    if (rule.selector.includes("text-inner-tspan")) {
      sectionTspanFills.set(section, rule.fill);
    } else if (rule.selector.includes("text")) {
      sectionTextFills.set(section, rule.fill);
    }
  }

  const withTspan = svg.replace(
    /<tspan(\b[^>]*)>([\s\S]*?)<\/tspan>/gi,
    (full, attrs: string, content: string) => {
      if (/\bfill=/.test(attrs) || /fill:/.test(attrs)) return full;
      const text = content.trim();
      if (!text) return full;

      const idx = svg.indexOf(full);
      const before = svg.slice(Math.max(0, idx - 1200), idx);
      const section = before.match(/section-(?:root|\d+)/g)?.at(-1) ?? "section-0";
      const fill = sectionTspanFills.get(section)
        ?? sectionTextFills.get(section)
        ?? (section === "section-root" ? "#ffffff" : "#1e293b");
      return `<tspan${attrs} fill="${fill}">${content}</tspan>`;
    },
  );

  return withTspan.replace(
    /<text(\b[^>]*)>([\s\S]*?)<\/text>/gi,
    (full, attrs: string, content: string) => {
      if (/\bfill=/.test(attrs) || /fill:/.test(attrs)) return full;
      if (content.includes("<tspan")) return full;

      const text = extractVisibleText(content);
      if (!text) return full;

      const idx = svg.indexOf(full);
      const before = svg.slice(Math.max(0, idx - 1200), idx);
      const section = before.match(/section-(?:root|\d+)/g)?.at(-1) ?? "section-0";
      const fill = sectionTextFills.get(section)
        ?? (section === "section-root" ? "#ffffff" : "#1e293b");
      return `<text${attrs} fill="${fill}">${content}</text>`;
    },
  );
}

function prepareWithoutDomParser(svg: string): string {
  const cssRules = parseCssFillRules(svg);
  let prepared = replaceForeignObjectsWithRegex(svg, cssRules);
  prepared = inlineTextFillsRegex(prepared, cssRules);
  return prepared;
}

function replaceForeignObjectsWithRegex(svg: string, _cssRules: CssFillRule[]): string {
  return svg.replace(
    /<foreignObject\b([^>]*)>([\s\S]*?)<\/foreignObject>/gi,
    (_match, attrs: string, inner: string) => {
      const text = extractVisibleText(inner);
      if (!text) return "";

      const readAttr = (name: string) =>
        attrs.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1];

      const x = parseLength(readAttr("x"));
      const y = parseLength(readAttr("y"));
      const width = parseLength(readAttr("width"));
      const height = parseLength(readAttr("height"));
      const color = extractTextColor(inner) ?? "#1e293b";
      const fill = color ? ` fill="${color}"` : "";

      return `<text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Helvetica, Arial, sans-serif" font-size="14"${fill}>${text}</text>`;
    },
  );
}

function prepareWithDomParser(svg: string, liveSvg?: SVGSVGElement | null): string {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = doc.documentElement;
  if (!(root instanceof SVGSVGElement)) return svg;
  return prepareSvgRoot(root, liveSvg);
}

/** Remplace foreignObject / styles CSS-only par du texte SVG explicite pour PNG/PDF. */
export function prepareMermaidSvgForRasterization(
  svg: string,
  liveSvg?: SVGSVGElement | null,
): string {
  const trimmed = svg.trim();
  if (!trimmed.includes("<svg")) return trimmed;

  if (typeof DOMParser !== "undefined" && typeof XMLSerializer !== "undefined") {
    try {
      return prepareWithDomParser(trimmed, liveSvg);
    } catch {
      return prepareWithoutDomParser(trimmed);
    }
  }

  return prepareWithoutDomParser(trimmed);
}

export function findLiveSchemaSvgForExport(): SVGSVGElement | null {
  if (typeof document === "undefined") return null;

  const exportSvg = document.querySelector(
    "[data-export-schema-root] [data-testid='mermaid-diagram'] svg",
  );
  if (exportSvg instanceof SVGSVGElement) return exportSvg;

  const diagrams = document.querySelectorAll("[data-testid='mermaid-diagram'] svg");
  if (diagrams.length === 0) return null;
  return diagrams[diagrams.length - 1] as SVGSVGElement;
}

export function svgLabelsAreReady(svg: SVGSVGElement): boolean {
  const foreignObjects = svg.querySelectorAll("foreignObject");
  if (foreignObjects.length > 0) {
    return [...foreignObjects].some((fo) => Boolean(fo.textContent?.trim()));
  }

  const texts = svg.querySelectorAll("text, tspan");
  if (texts.length > 0) {
    return [...texts].some((node) => Boolean(node.textContent?.trim()));
  }

  return svg.querySelector("rect, path, circle, polygon") !== null;
}
