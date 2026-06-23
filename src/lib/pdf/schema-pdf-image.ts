export interface SchemaPdfAsset {
  dataUrl: string;
  widthPt: number;
  heightPt: number;
}

function buildAssetFromPngBuffer(
  pngBuffer: Buffer,
  maxWidthPt: number,
): Promise<SchemaPdfAsset | null> {
  return (async () => {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(pngBuffer).metadata();
    const imgWidthPx = meta.width ?? 0;
    const imgHeightPx = meta.height ?? 0;

    if (imgWidthPx <= 0 || imgHeightPx <= 0) return null;

    const widthPt = maxWidthPt;
    const heightPt = (imgHeightPx / imgWidthPx) * maxWidthPt;
    const maxHeightPt = maxWidthPt * 1.4;
    const scale = heightPt > maxHeightPt ? maxHeightPt / heightPt : 1;

    return {
      dataUrl: `data:image/png;base64,${pngBuffer.toString("base64")}`,
      widthPt: widthPt * scale,
      heightPt: heightPt * scale,
    };
  })();
}

export async function prepareSchemaPdfAssetFromPng(
  pngDataUrl: string,
  maxWidthPt: number,
): Promise<SchemaPdfAsset | null> {
  const match = pngDataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!match?.[1]) return null;

  try {
    return await buildAssetFromPngBuffer(Buffer.from(match[1], "base64"), maxWidthPt);
  } catch (err) {
    console.warn("[prepareSchemaPdfAssetFromPng]", err);
    return null;
  }
}

import { prepareMermaidSvgForRasterization } from "@/lib/mermaid/prepare-mermaid-svg-for-rasterization";

export async function prepareSchemaPdfAssetFromSvg(
  svg: string,
  maxWidthPt: number,
): Promise<SchemaPdfAsset | null> {
  const trimmed = prepareMermaidSvgForRasterization(svg.trim());
  if (!trimmed.includes("<svg")) return null;

  try {
    const sharp = (await import("sharp")).default;
    const pixelWidth = Math.max(320, Math.round(maxWidthPt * 2));

    const pngBuffer = await sharp(Buffer.from(trimmed), { density: 150 })
      .png()
      .resize({
        width: pixelWidth,
        fit: "inside",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toBuffer();

    return buildAssetFromPngBuffer(pngBuffer, maxWidthPt);
  } catch (err) {
    console.warn("[prepareSchemaPdfAssetFromSvg]", err);
    return null;
  }
}
