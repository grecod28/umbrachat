export const ROOM_VISIBILITY = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
} as const;

export type RoomVisibility =
  (typeof ROOM_VISIBILITY)[keyof typeof ROOM_VISIBILITY];
