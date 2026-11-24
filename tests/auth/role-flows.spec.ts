import { test, expect } from "@playwright/test";
const password = process.env.NUMERIQ_DEMO_PASSWORD!;
async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk", exact: false }).click();
}
test("school admin sees scoped seats; parent opens school-funded home module and progress persists", async ({
  page,
}) => {
  await login(page, "admin@numeriq.test");
  await expect(page).toHaveURL(/\/school$/);
  await expect(page.getByRole("heading", { name: "Plan sekolah" })).toBeVisible();
  await expect(page.getByText(/Verifikasi manual/)).toBeVisible();
  await page.goto("/school/people");
  await expect(
    page.getByRole("heading", { name: "Orang dan kursi" }),
  ).toBeVisible();
  await expect(page.locator("article.child-card")).toHaveCount(2);
  await page.getByRole("button", { name: /Keluar dari akun/ }).click();
  await login(page, "wali@numeriq.test");
  await expect(page).toHaveURL(/\/parent$/);
  await expect(page.getByRole("heading", { name: "Home Plan sandbox" })).toBeVisible();
  await expect(page.getByText(/Checkout tambahan diblokir/)).toBeVisible();
  const child = page
    .locator("article.child-card")
    .filter({ hasText: "Nara Demo" });
  await expect(child).toContainText("Termasuk lisensi sekolah");
  await child.getByRole("button", { name: /Buka ruang anak/ }).click();
  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByText(/dibiayai sekolah/)).toBeVisible();
  await expect(page.locator("article.child-card")).toHaveCount(12);
  await page
    .locator("article.child-card")
    .filter({ hasText: "NS-01" })
    .getByRole("link", { name: /Buka modul/ })
    .click();
  await page
    .getByRole("button", { name: "Kotak 1, kosong", exact: true })
    .click();
  await page.getByRole("button", { name: /Selesai mencoba/ }).click();
  await page.getByRole("button", { name: "Simpan sebagai selesai" }).click();
  await expect(page).toHaveURL(/\/student\?completed=NS-01/);
  await expect(page.getByRole("status")).toContainText("NS-01");
  await page.getByText("Kembali ke ruang pendamping", { exact: true }).click();
  await page.getByLabel("Kata sandi pendamping").fill(password);
  await page.getByRole("button", { name: /Verifikasi dan kembali/ }).click();
  await expect(page).toHaveURL(/\/parent$/);
  await expect(
    page.locator("article.child-card").filter({ hasText: "Nara Demo" }),
  ).toContainText("1 / 12 modul selesai");
});
