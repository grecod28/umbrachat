-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL DEFAULT 'Untitled Chat',
    "description" VARCHAR(2048) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomAccess" (
    "roomId" TEXT NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,

    CONSTRAINT "RoomAccess_pkey" PRIMARY KEY ("roomId")
);

-- CreateTable
CREATE TABLE "ChatItem" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "itemId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "File" (
    "itemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("itemId")
);

-- CreateIndex
CREATE INDEX "Room_lastMessageAt_idx" ON "Room"("lastMessageAt");

-- AddForeignKey
ALTER TABLE "RoomAccess" ADD CONSTRAINT "RoomAccess_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatItem" ADD CONSTRAINT "ChatItem_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ChatItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ChatItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
