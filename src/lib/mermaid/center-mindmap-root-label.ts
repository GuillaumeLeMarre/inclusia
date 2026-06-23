function centerForeignObjectLabel(foreignObject: Element): void {
  const block = foreignObject.querySelector("div, span, p");
  if (block instanceof HTMLElement) {
    block.style.display = "flex";
    block.style.alignItems = "center";
    block.style.justifyContent = "center";
    block.style.textAlign = "center";
    block.style.width = "100%";
    block.style.height = "100%";
  }

  foreignObject.querySelectorAll("span, p, div").forEach((element) => {
    if (!(element instanceof HTMLElement)) return;
    element.style.textAlign = "center";
    element.style.margin = "0 auto";
  });
}

function centerSvgTextLabel(element: SVGTextElement | SVGTSpanElement): void {
  element.setAttribute("text-anchor", "middle");
  element.setAttribute("dominant-baseline", "middle");
}

/** Centre le libellé dans le nœud principal (section-root) d'une mindmap. */
export function centerMindmapRootNodeLabels(svg: SVGSVGElement): void {
  const rootSelectors = [
    ".mindmap-node.section-root",
    "g.section-root",
    "[class*='section-root']",
  ];

  rootSelectors.forEach((selector) => {
    svg.querySelectorAll(selector).forEach((node) => {
      node.querySelectorAll("foreignObject").forEach(centerForeignObjectLabel);
      node.querySelectorAll("text").forEach((text) => {
        if (text instanceof SVGTextElement) centerSvgTextLabel(text);
      });
      node.querySelectorAll("tspan").forEach((tspan) => {
        if (tspan instanceof SVGTSpanElement) centerSvgTextLabel(tspan);
      });
    });
  });
}
