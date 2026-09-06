import { test, expect } from "@playwright/test";

test.describe("Lead Modal & Form Accessibility", () => {
  test("ochilganda dialog role va aria-modal atributlariga ega bo'ladi, Escape bilan yopiladi", async ({ page }) => {
    await page.goto("/");
    // Karusel ichidagi (vaqtincha ko'rinmas) tugma o'rniga navbar'dagi barqaror CTA.
    await page.getByRole("button", { name: "Ariza topshirish" }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute("aria-labelledby", "lead-modal-title");

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("tarmoq uzilganda ariza xotirada saqlangani haqida xabar beradi", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ariza topshirish" }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.route("**/api/leads", (route) => route.abort("internetdisconnected"));

    // Placeholder o'rniga label — placeholder matni dizayn bilan birga o'zgaradi.
    await dialog.getByLabel(/Ism va Familiyangiz/i).fill("E2E Offline Test");
    await dialog.getByLabel(/Telefon Raqamingiz/i).fill("+998 90 123 45 67");
    await dialog.getByRole("button", { name: /Yuborish|Tasdiqlash/i }).click();

    // Tasdiq ekrani + "qurilmada saqlandi" belgisi — ikkalasi ham ko'rinishi kerak.
    await expect(dialog.getByRole("heading", { name: /Arizangiz Qabul Qilindi/i })).toBeVisible();
    await expect(dialog.getByText(/Qurilmangizda saqlandi/i)).toBeVisible();
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

test.describe("Harakatni kamaytirish rejimi", () => {
  test.use({ reducedMotion: "reduce" });

  // Eslatma: hydration nomuvofiqligining O'ZI production build'da konsolga
  // yozilmaydi (React jimgina qayta render qiladi), shuning uchun uni e2e bilan
  // ushlab bo'lmaydi. Bu yerda tekshiriladigan narsa — kuzatiladigan xatti-harakat:
  // harakat kamaytirilgan bo'lsa kontent darhol ko'rinishi va sanoq yakuniy
  // qiymatda turishi kerak (`opacity: 0` da qotib qolmasin).
  test("kontent darhol ko'rinadi va sanoq yakuniy qiymatda turadi", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    // ScrollReveal bilan o'ralgan bo'lim animatsiya kutmasdan ko'rinadi.
    const results = page.locator("#natijalar");
    await expect(results).toBeVisible();
    await expect(results.getByText("OTM Talabalari").first()).toBeVisible();

    // AnimatedCounter reduced-motion'da 0 da qolmasligi kerak.
    const counter = results.locator("span", { hasText: /^\d[\d\u00a0]*\+$/ }).first();
    await expect(counter).not.toHaveText("0+");
  });
});
