import { test, expect } from "@playwright/test";
import { loginIfConfigured, openMobileNav } from "./helpers/auth";

test.describe("Navigation responsive", () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginIfConfigured(page);
    test.skip(!loggedIn, "E2E_EMAIL et E2E_PASSWORD requis pour les tests authentifiés");
  });

  test("dashboard s'affiche sans scroll horizontal", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });

  test("menu mobile ouvre le drawer et navigue vers Élèves", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Test réservé aux viewports mobile");

    await page.goto("/dashboard");
    await openMobileNav(page);

    const studentsLink = page.getByRole("link", { name: "Élèves" });
    await expect(studentsLink).toBeVisible();
    await studentsLink.click();

    await expect(page).toHaveURL(/\/students/);
    await expect(page.getByRole("heading", { name: "Élèves" })).toBeVisible();
  });

  test("navigation vers documents et adaptations", async ({ page }) => {
    await page.goto("/documents");
    await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible();
    await expect(page.getByText("Glissez-déposez votre document ici")).toBeVisible();

    await page.goto("/adaptations");
    await expect(page.getByRole("heading", { name: "Adaptations" })).toBeVisible();
  });

  test("formulaire nouvel élève — champs pleine largeur", async ({ page, isMobile }) => {
    await page.goto("/students/new");
    await expect(page.getByRole("heading", { name: "Nouvel élève" })).toBeVisible();

    const firstName = page.getByLabel("Prénom *");
    await expect(firstName).toBeVisible();

    if (isMobile) {
      const box = await firstName.boundingBox();
      const viewport = page.viewportSize();
      expect(box).not.toBeNull();
      expect(viewport).not.toBeNull();
      if (box && viewport) {
        expect(box.width).toBeGreaterThan(viewport.width * 0.7);
      }
    }
  });

  test("wizard adaptation accessible", async ({ page }) => {
    await page.goto("/adaptations/new");
    await expect(page.getByRole("heading", { name: "Nouvelle adaptation" })).toBeVisible();
  });
});

test.describe("Connexion", () => {
  test("page login responsive", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();

    const submit = page.getByRole("button", { name: "Se connecter" });
    await expect(submit).toBeVisible();

    const box = await submit.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });
});
