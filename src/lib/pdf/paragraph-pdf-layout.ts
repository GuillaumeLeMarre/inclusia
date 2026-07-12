/** Nombre minimal de lignes d'un paragraphe à garder ensemble lors d'un saut de page. */
export const MIN_PARAGRAPH_LINES_TOGETHER = 2;

export function countLinesForPageChunk(
  linesLeft: number,
  linesThatFit: number,
): number {
  if (linesLeft <= 0 || linesThatFit <= 0) return 0;

  if (linesLeft <= MIN_PARAGRAPH_LINES_TOGETHER) {
    return linesLeft;
  }

  if (linesThatFit === 1) {
    return 0;
  }

  if (linesLeft - linesThatFit === 1) {
    const reduced = linesThatFit - 1;
    if (reduced >= MIN_PARAGRAPH_LINES_TOGETHER) {
      return reduced;
    }
    return 0;
  }

  return Math.min(linesThatFit, linesLeft);
}

export function shouldStartBlockOnFreshPage(
  blockHeight: number,
  remainingHeight: number,
  usablePageHeight: number,
): boolean {
  if (blockHeight <= remainingHeight) return false;
  return blockHeight <= usablePageHeight;
}
