import { test, expect } from "./fixtures";

test.describe("Appearance and language", () => {
  test("persists the paper theme and switches the interface language", async ({
    page,
  }) => {
    await page.goto("/en/config/shape");

    await page.getByRole("button", { name: /Paper/ }).click();
    await expect(page.locator("html")).toHaveClass(/light/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/light/);

    await page.getByRole("button", { name: /Night/ }).click();
    await expect(page.locator("html")).not.toHaveClass(/light/);

    await page.goto("/en/config/language");
    await page.getByRole("button", { name: /Español/ }).click();

    await expect(page).toHaveURL(/\/es\/config\/language$/);
    await expect(page.getByRole("heading", { name: "Ajustes" })).toBeVisible();
  });
});
