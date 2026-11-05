import {
  test,
  expect,
  uniqueRoomName,
  trackRoomFromUrl,
} from "./fixtures";

test.describe("Rooms and messages", () => {
  test("creates a public room, sends a real message and deletes it from the UI", async ({
    page,
    roomApi,
  }) => {
    const name = uniqueRoomName("E2E Public");

    await page.goto("/en/chat/create");
    await page.getByLabel("Name", { exact: true }).fill(name);
    await page.getByLabel("Description", { exact: true }).fill("Room created by Playwright");
    await page.getByRole("button", { name: "Create room" }).click();

    await expect(page).toHaveURL(/\/en\/chat\/[0-9a-f-]{36}$/i);
    trackRoomFromUrl(page, roomApi);
    await expect(page.getByRole("heading", { name })).toBeVisible();

    const composer = page.getByLabel("Type a message...");
    await expect(composer).toBeVisible();
    await composer.fill("Mensaje E2E real");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("Mensaje E2E real")).toBeVisible();

    await page
      .locator("main header")
      .getByRole("button", { name: "Settings" })
      .click();
    await page.getByRole("button", { name: "Delete chat" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Delete" })
      .click();

    await expect(page).toHaveURL(/\/en\/chat\/default$/);
  });

  test("finds an API-created room through the search form", async ({
    page,
    roomApi,
  }) => {
    const room = await roomApi.create({
      name: uniqueRoomName("E2E Search"),
    });

    await page.goto("/en/chat/search");
    await page.getByPlaceholder("Search rooms...").fill(room.name);

    await expect(page.getByText(room.name).first()).toBeVisible();

    await page
      .getByRole("link", { name: new RegExp(room.name, "i") })
      .click();

    await expect(page).toHaveURL(new RegExp(`/en/chat/${room.id}$`, "i"));
  });

  test("validates the private-room form before hitting the API", async ({
    page,
  }) => {
    await page.goto("/en/chat/create");
    await page.getByLabel("Name", { exact: true }).fill(uniqueRoomName("E2E Invalid"));
    await page.getByRole("button", { name: /Private/ }).click();
    await page.getByRole("button", { name: "Create room" }).click();

    await expect(
      page.getByText("Password is required for private rooms"),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/en\/chat\/create$/);
  });
});
