import {
  test,
  expect,
  uniqueRoomName,
  trackRoomFromUrl,
} from "./fixtures";

test.describe("Private room access", () => {
  test("creates a private room, rejects a wrong code and grants access with the real JWT flow", async ({
    page,
    roomApi,
  }) => {
    const name = uniqueRoomName("E2E Private");

    await page.goto("/en/chat/create");
    await page.getByLabel("Name", { exact: true }).fill(name);
    await page.getByRole("button", { name: /Private/ }).click();
    await page.getByLabel("Password", { exact: true }).fill("a1b2c3");
    await page.getByRole("button", { name: "Create room" }).click();

    await expect(page).toHaveURL(/\/en\/chat\/[0-9a-f-]{36}$/i);
    trackRoomFromUrl(page, roomApi);

    await expect(page.getByText("This room is private")).toBeVisible();

    await page.getByLabel("Code", { exact: true }).fill("ZZZZZZ");
    await page.getByRole("button", { name: "Access" }).click();
    await expect(page.getByText("Incorrect code")).toBeVisible();

    await page.getByLabel("Code", { exact: true }).fill("A1B2C3");
    await page.getByRole("button", { name: "Access" }).click();

    const composer = page.getByLabel("Type a message...");
    await expect(composer).toBeVisible();
    await composer.fill("Mensaje privado E2E");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("Mensaje privado E2E")).toBeVisible();
  });
});
