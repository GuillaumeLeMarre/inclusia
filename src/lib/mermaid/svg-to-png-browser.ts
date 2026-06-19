function parseSvgDimensions(svg: string): { width: number; height: number } {
  const viewBoxMatch = svg.match(/viewBox=["']([^"']+)["']/i);
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1]!.trim().split(/\s+/).map(Number);
    if (parts.length === 4 && parts[2]! > 0 && parts[3]! > 0) {
      return { width: parts[2]!, height: parts[3]! };
    }
  }

  const widthMatch = svg.match(/\bwidth=["']([\d.]+)/i);
  const heightMatch = svg.match(/\bheight=["']([\d.]+)/i);
  const width = widthMatch ? parseFloat(widthMatch[1]!) : 0;
  const height = heightMatch ? parseFloat(heightMatch[1]!) : 0;

  if (width > 0 && height > 0) return { width, height };
  return { width: 800, height: 600 };
}

export function normalizeSvgForRasterization(svg: string): string {
  let out = svg.trim();
  const { width, height } = parseSvgDimensions(out);

  if (!/xmlns=/.test(out)) {
    out = out.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  out = out.replace(/\swidth=["'][^"']*["']/gi, "");
  out = out.replace(/\sheight=["'][^"']*["']/gi, "");

  return out.replace(
    "<svg",
    `<svg width="${Math.round(width)}" height="${Math.round(height)}"`,
  );
}

export async function svgToPngDataUrl(
  svg: string,
  scale = 2,
): Promise<string | null> {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  const normalized = normalizeSvgForRasterization(svg);
  const { width, height } = parseSvgDimensions(normalized);
  const canvasWidth = Math.max(1, Math.round(width * scale));
  const canvasHeight = Math.max(1, Math.round(height * scale));

  return new Promise((resolve) => {
    const img = new Image();
    const blob = new Blob([normalized], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    let settled = false;

    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(objectUrl);
      resolve(value);
    };

    const timer = window.setTimeout(() => {
      console.warn("[svgToPngDataUrl] Délai dépassé lors de la conversion SVG → PNG.");
      finish(null);
    }, 15_000);

    img.onload = () => {
      window.clearTimeout(timer);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        finish(canvas.toDataURL("image/png"));
      } catch (err) {
        console.warn("[svgToPngDataUrl] Erreur canvas:", err);
        finish(null);
      }
    };

    img.onerror = () => {
      window.clearTimeout(timer);
      console.warn("[svgToPngDataUrl] Impossible de charger le SVG dans une image.");
      finish(null);
    };

    img.src = objectUrl;
  });
}
