import { test, expect } from "@playwright/test";

test.describe("Lead Modal & Form Accessibility", () => {
  test("ochilganda dialog role va aria-modal atributlariga ega bo'ladi, Escape bilan yopiladi", async ({ page }) => {
    await page.goto("/");
    const openBtn = page.getByRole("button", { name: /Qabulga Yozilish|1-Dars Bepul Joy Olish/i }).first();
    await openBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute("aria-labelledby", "lead-modal-title");

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("tarmoq uzilganda ariza xotirada saqlangani haqida xabar beradi", async ({ page }) => {
    await page.goto("/");
    const openBtn = page.getByRole("button", { name: /Qabulga Yozilish|1-Dars Bepul Joy Olish/i }).first();
    await openBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.route("**/api/leads", (route) => route.abort("internetdisconnected"));

    await page.fill('input[placeholder*="Ism"]', "E2E Offline Test");
    await page.fill('input[placeholder*="Telefon"]', "+998 90 123 45 67");
    await dialog.getByRole("button", { name: /Yuborish|Tasdiqlash/i }).click();

    await expect(dialog.getByText(/Qabul Qilindi|Qurilmangizda saqlandi/i)).toBeVisible();
  });
});

test.describe("Admin Panel", () => {
  test("login sahifasi mavjud va noto'g'ri parolni rad etadi", async ({ page }) => {
    await page.goto("/admin");
    const input = page.locator('input[type="password"]');
    await expect(input).toBeVisible();

    await input.fill("noto'g'ri-parol");
    await page.getByRole("button", { name: /Kirish/i }).click();
    await expect(page.getByText(/Parol noto'g'ri/i)).toBeVisible();
  });
});
