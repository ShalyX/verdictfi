import { expect, test } from "@playwright/test";

test("first-time visitor sees pitch before the live desk", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /verdicts you can audit/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /enter the desk/i }).first()).toBeVisible();
  await expect(page.getByLabel("Notional USD")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /generate accountable signal/i })).toHaveCount(0);
});

test("onboarding explains the flow and can enter the desk", async ({ page }) => {
  await page.goto("/onboarding");

  await expect(page.getByText(/pick an asset/i)).toBeVisible();
  await page.getByRole("button", { name: /^next$/i }).click();
  await expect(page.getByText(/risk agent challenges/i)).toBeVisible();
  await page.getByRole("button", { name: /^next$/i }).click();
  await expect(page.getByText(/outcome gets tracked/i)).toBeVisible();
  await page.getByRole("link", { name: /enter the desk/i }).click();
  await expect(page).toHaveURL(/\/desk$/);
  await expect(page.getByLabel("Notional USD")).toBeVisible();
});

test("dashboard generates a persisted public packet", async ({ page }) => {
  await page.goto("/desk");
  await expect(page.getByRole("heading", { name: /run the desk/i })).toBeVisible();
  await expect(page.getByText(/SoDEX submission remains intentionally gated/i)).toHaveCount(0);
  await expect(page.getByText(/Evidence Packet/i).first()).toBeVisible();

  await page.getByLabel("Notional USD").fill("3000");
  await page.getByRole("button", { name: /generate accountable signal/i }).click();

  await expect(page.getByText(/approved|caution|rejected/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /public packet/i })).toBeVisible();

  await page.getByRole("link", { name: /public packet/i }).click();
  await expect(page.getByRole("heading", { name: /BTC · (LONG|SHORT|HOLD) verdict/i })).toBeVisible();
  await expect(page.getByText(/Public case file/i)).toBeVisible();
  await expect(page.getByText(/Raw packet JSON/i)).toBeVisible();
});

test("track record is a separate case log page", async ({ page }) => {
  await page.goto("/track-record");

  await expect(page.getByRole("heading", { name: /case log/i })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("link", { name: /run the desk/i }).first()).toBeVisible();
  await expect(page.getByLabel("Notional USD")).toHaveCount(0);
});
