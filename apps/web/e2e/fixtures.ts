import {
  test as base,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

export const API_URL =
  process.env.E2E_API_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

export type RoomPayload = {
  name: string;
  description?: string;
  visibility?: "PUBLIC" | "PRIVATE";
  password?: string;
};

export type Room = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastMessageAt: string;
};

class RoomApi {
  private readonly created: string[] = [];

  constructor(private readonly request: APIRequestContext) {}

  async create(payload: RoomPayload): Promise<Room> {
    const response = await this.request.post(`${API_URL}/rooms`, {
      data: {
        description: "created by Playwright",
        visibility: "PUBLIC",
        ...payload,
      },
    });

    expect(response.ok()).toBeTruthy();
    const room = (await response.json()) as Room;
    this.track(room.id);
    return room;
  }

  track(roomId: string): void {
    if (roomId && !this.created.includes(roomId)) {
      this.created.push(roomId);
    }
  }

  untrack(roomId: string): void {
    const index = this.created.indexOf(roomId);
    if (index >= 0) this.created.splice(index, 1);
  }

  async cleanup(): Promise<void> {
    await Promise.all(
      this.created.map(async (roomId) => {
        await this.request.delete(`${API_URL}/rooms/${roomId}`).catch(() => {
          // Best effort cleanup; the test result already has the real failure.
        });
      }),
    );
  }
}

type Fixtures = {
  roomApi: RoomApi;
};

export const test = base.extend<Fixtures>({
  roomApi: async ({ request }, provideFixture) => {
    const roomApi = new RoomApi(request);
    await provideFixture(roomApi);
    await roomApi.cleanup();
  },
});

export function uniqueRoomName(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function roomIdFromUrl(page: Page): string | null {
  const match = page.url().match(/\/chat\/([0-9a-f-]{36})(?:\/|$)/i);
  return match?.[1] ?? null;
}

export function trackRoomFromUrl(page: Page, roomApi: RoomApi): string {
  const roomId = roomIdFromUrl(page);
  expect(roomId).not.toBeNull();
  roomApi.track(roomId as string);
  return roomId as string;
}

export { expect };
