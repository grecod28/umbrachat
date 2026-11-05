import { test, expect } from "./fixtures";

test.describe("Main navigation", () => {
  test("navigates through the public site and the chat shell", async ({
    page,
  }) => {
    await page.goto("/en");

    const siteHeader = page.getByRole("banner");

    await expect(
      page.getByRole("heading", { name: "Welcome to UmbraChat" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create a room" }),
    ).toBeVisible();

    await siteHeader.getByRole("link", { name: "Info" }).click();
    await expect(page).toHaveURL(/\/en\/info$/);
    await expect(
      page.getByRole("heading", { name: "Information" }),
    ).toBeVisible();

    await siteHeader.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/en\/contact$/);
    await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();

    await siteHeader.getByRole("link", { name: "Chats" }).click();
    await expect(page).toHaveURL(/\/en\/chat\/default$/);
    await expect(page.getByRole("heading", { name: "My Chats" })).toBeVisible();

    // Inside the chat shell the sidebar owns these shortcuts.
    await page.getByRole("button", { name: "Settings" }).click();
    await page
      .getByRole("menu")
      .getByRole("link", { name: "Search rooms" })
      .click();
    await expect(page).toHaveURL(/\/en\/chat\/search$/);
    await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();

    await page.getByRole("link", { name: "UmbraChat" }).click();
    await expect(page).toHaveURL(/\/en\/chat\/default$/);

    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/en\/config\//);
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });
});
