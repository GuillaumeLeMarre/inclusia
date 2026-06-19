import type { Page } from "@playwright/test";

export async function loginIfConfigured(page: Page): Promise<boolean> {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    return false;
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  return true;
}

export async function openMobileNav(page: Page) {
  const menuButton = page.getByRole("button", { name: "Ouvrir le menu" });
  if (await menuButton.isVisible()) {
    await menuButton.click();
  }
}
