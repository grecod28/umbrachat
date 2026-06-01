import type { Room } from "@prisma/client";

export * from "@prisma/client";

export type RoomWithPrivate = Room & {
  isPrivate: boolean;
};
