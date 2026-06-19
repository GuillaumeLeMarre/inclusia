import { test, expect } from "@playwright/test";

const VALID_MERMAID = `mindmap
  root((Test))
    Branche A
    Branche B`;

const INVALID_MERMAID = "not valid {{ mermaid";

test.describe("MermaidRenderer", () => {
  test("affiche un diagramme Mermaid valide", async ({ page }) => {
    await page.goto("/test/mermaid");
    await page.getByTestId("mermaid-code-input").fill(VALID_MERMAID);
    await expect(page.getByTestId("mermaid-diagram")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("mermaid-error")).not.toBeVisible();
  });

  test("affiche le message d'erreur si Mermaid échoue", async ({ page }) => {
    await page.goto("/test/mermaid");
    await page.getByTestId("mermaid-code-input").fill(INVALID_MERMAID);
    await expect(page.getByTestId("mermaid-error")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Impossible de générer le schéma.")).toBeVisible();
  });
});
