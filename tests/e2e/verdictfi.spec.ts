import { expect, test } from "@playwright/test";

test("judge flow generates a persisted public packet", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /one-person finance desk/i })).toBeVisible();

  await page.getByLabel("Notional USD").fill("3000");
  await page.getByRole("button", { name: /generate accountable signal/i }).click();

  await expect(page.getByText(/approved|caution|rejected/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /public packet/i })).toBeVisible();

  await page.getByRole("link", { name: /public packet/i }).click();
  await expect(page.getByRole("heading", { name: /BTC · (LONG|SHORT|HOLD) verdict/i })).toBeVisible();
  await expect(page.getByText(/Raw packet JSON/i)).toBeVisible();
});
