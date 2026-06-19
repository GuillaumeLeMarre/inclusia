export function isTimelineDiagram(code: string): boolean {
  return /^\s*timeline\b/mi.test(code.trim());
}

function parseNum(value: string | null, fallback = 0): number {
  const parsed = parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Repositionne la frise horizontale sous les événements (comportement Mermaid par défaut incorrect). */
export function fixTimelineAxisPosition(svg: SVGSVGElement): void {
  const lines = Array.from(svg.querySelectorAll("line"));

  const axisLine = lines.find((line) => {
    const y1 = parseNum(line.getAttribute("y1"));
    const y2 = parseNum(line.getAttribute("y2"));
    const x1 = parseNum(line.getAttribute("x1"));
    const x2 = parseNum(line.getAttribute("x2"));
    const strokeWidth = parseNum(line.getAttribute("stroke-width"), 1);
    return Math.abs(y1 - y2) < 2 && Math.abs(x2 - x1) > 80 && strokeWidth >= 3;
  });

  if (!axisLine) return;

  const currentAxisY = parseNum(axisLine.getAttribute("y1"));
  let maxContentBottom = currentAxisY;

  const eventGroups = svg.querySelectorAll(".eventWrapper");
  if (eventGroups.length > 0) {
    eventGroups.forEach((group) => {
      const bbox = (group as SVGGElement).getBBox();
      maxContentBottom = Math.max(maxContentBottom, bbox.y + bbox.height);
    });
  } else {
    svg.querySelectorAll(".timeline-node").forEach((node) => {
      const bbox = (node as SVGGElement).getBBox();
      if (bbox.y + bbox.height > currentAxisY - 10) {
        maxContentBottom = Math.max(maxContentBottom, bbox.y + bbox.height);
      }
    });
  }

  const newAxisY = maxContentBottom + 40;
  if (newAxisY <= currentAxisY + 6) return;

  axisLine.setAttribute("y1", String(newAxisY));
  axisLine.setAttribute("y2", String(newAxisY));

  lines.forEach((line) => {
    const x1 = parseNum(line.getAttribute("x1"));
    const x2 = parseNum(line.getAttribute("x2"));
    const y1 = parseNum(line.getAttribute("y1"));
    const y2 = parseNum(line.getAttribute("y2"));
    const isVertical = Math.abs(x1 - x2) < 2;
    const isConnector = Boolean(line.getAttribute("stroke-dasharray"));

    if (isVertical && isConnector && y2 > y1) {
      line.setAttribute("y2", String(newAxisY));
    }
  });

  const padding = 50;
  const box = svg.getBBox();
  svg.setAttribute(
    "viewBox",
    `${box.x - padding} ${box.y - padding} ${box.width + padding * 2} ${box.height + padding * 2}`,
  );
}
