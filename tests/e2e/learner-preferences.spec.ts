import { expect, test } from "@playwright/test";
import { loginIfConfigured } from "./helpers/auth";

// Régression : le trigger on_learner_profile_created crée déjà la ligne
// learning_preferences ; l'upsert du formulaire renvoyait 409 et les
// préférences n'étaient jamais enregistrées.
test("création d'un profil apprenant : préférences enregistrées", async ({ page }) => {
  test.skip(!(await loginIfConfigured(page)), "E2E_EMAIL / E2E_PASSWORD non définis");

  const preferencesResponse = page.waitForResponse(
    (response) => response.url().includes("/rest/v1/learning_preferences")
      && response.request().method() === "POST",
  );

  await page.goto("/learners/new");
  await page.locator("#profileName").fill(`E2E-preferences-${Date.now()}`);
  await page.getByRole("button", { name: /dyslexie/i }).first().click();
  await page.getByRole("button", { name: "Créer le profil" }).click();

  const response = await preferencesResponse;
  expect(response.status()).toBeLessThan(400);
  await page.waitForURL("**/learners", { timeout: 15_000 });
});
