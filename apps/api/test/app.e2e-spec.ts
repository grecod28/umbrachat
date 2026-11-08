import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import request from 'supertest';
import { io, Socket } from 'socket.io-client';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { ANONYMOUS_SESSION_HEADER } from '../src/modules/auth/anonymous-session.constants';
import { createTestApp, resetDatabase } from './test-app';

type RoomBody = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastMessageAt: string;
};

type RoomListBody = RoomBody[];

type SearchBody = {
  data: RoomBody[];
  meta: { total: number; page: number; lastPage: number };
};

type AccessBody = { token: string };

type MessageBody = {
  id: string;
  roomId: string;
  content?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
};

type UploadUrlsBody = {
  files: { url: string; fields: Record<string, string> }[];
};

type DownloadUrlBody = { url: string };

/**
 * E2E suite against the real NestJS application and a real PostgreSQL database.
 *
 * The only replaced provider is S3Service (paid third-party service). There are
 * no repository, service, controller, guard, JWT, bcrypt or database mocks.
 */
describe('UmbraChat API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: Server;
  let sessionToken: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    http = app.getHttpServer() as Server;

    const sessionResponse = await request(http).post('/session').expect(200);
    sessionToken = (sessionResponse.body as { token: string }).token;
  });

  function withSessionHeader(test: request.Test) {
    return test.set(ANONYMOUS_SESSION_HEADER, sessionToken);
  }

  function get(path: string) {
    return withSessionHeader(request(http).get(path));
  }

  function post(path: string) {
    return withSessionHeader(request(http).post(path));
  }

  function del(path: string) {
    return withSessionHeader(request(http).delete(path));
  }

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  async function createRoom(payload: Record<string, unknown> = {}) {
    const response = await post('/rooms')
      .send({
        name: `room-${randomUUID()}`,
        description: 'e2e room',
        visibility: 'PUBLIC',
        ...payload,
      })
      .expect(201);

    return response.body as RoomBody;
  }

  async function createPrivateRoom(password = 'A1B2C3') {
    return createRoom({
      name: `private-${randomUUID()}`,
      visibility: 'PRIVATE',
      password,
    });
  }

  async function getPrivateToken(roomId: string, password = 'A1B2C3') {
    const response = await post(`/rooms/${roomId}/access`)
      .send({ password })
      .expect(201);

    const body = response.body as AccessBody;
    return body.token;
  }

  describe('Anonymous session', () => {
    it('issues a signed anonymous session token', async () => {
      const response = await request(http).post('/session').expect(200);

      expect(response.body).toMatchObject({
        token: expect.any(String),
        sessionId: expect.any(String),
        expiresAt: expect.any(String),
      });
    });

    it('rejects writes without a valid session token', async () => {
      await request(http)
        .post('/rooms')
        .send({ visibility: 'PUBLIC' })
        .expect(401);

      await request(http)
        .post('/rooms')
        .set(ANONYMOUS_SESSION_HEADER, 'not-a-valid-session')
        .send({ visibility: 'PUBLIC' })
        .expect(401);
    });

    it('rejects websocket connections without a valid session token', async () => {
      await expect(connectSocket('')).rejects.toThrow();
    });
  });

  describe('Rooms CRUD', () => {
    it('creates, reads, lists and deletes a public room', async () => {
      const name = `Public room ${randomUUID()}`;
      const created = await createRoom({ name, description: 'Public e2e' });

      expect(created).toMatchObject({
        name,
        description: 'Public e2e',
      });

      const getResponse = await get(`/rooms/${created.id}`).expect(200);

      expect(getResponse.body).toMatchObject({
        id: created.id,
        name,
        isPrivate: false,
      });

      const listResponse = await get('/rooms')
        .query({ ids: created.id })
        .expect(200);

      const list = listResponse.body as RoomListBody;
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(created.id);

      await del(`/rooms/${created.id}`).expect(200);
      await get(`/rooms/${created.id}`).expect(404);
      await del(`/rooms/${created.id}`).expect(404);
    });

    it('validates DTOs and path parameters', async () => {
      await post('/rooms').send({}).expect(400);
      await post('/rooms').send({ visibility: 'INVALID' }).expect(400);
      await post('/rooms')
        .send({ visibility: 'PUBLIC', name: 'x'.repeat(121) })
        .expect(400);
      await post('/rooms').send({ visibility: 'PRIVATE' }).expect(400);
      await post('/rooms')
        .send({ visibility: 'PRIVATE', password: '12345' })
        .expect(400);

      await get('/rooms').expect(400);
      await get('/rooms/not-a-uuid').expect(400);
      await get(`/rooms/${randomUUID()}`).expect(404);
    });

    it('returns only public rooms in search and counts only public matches', async () => {
      const needle = `search-${randomUUID()}`;

      await createRoom({ name: `${needle} public` });
      await createRoom({
        name: `${needle} private`,
        visibility: 'PRIVATE',
        password: 'A1B2C3',
      });

      const response = await get('/rooms/search')
        .query({ name: needle, page: 1 })
        .expect(200);

      const body = response.body as SearchBody;
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe(`${needle} public`);
      expect(body.meta).toMatchObject({
        total: 1,
        page: 1,
        lastPage: 1,
      });
    });

    it('searches case-insensitively and paginates', async () => {
      const needle = `Case-${randomUUID()}`;
      await createRoom({ name: `${needle} Alpha` });
      await createRoom({ name: `${needle} Beta` });

      const firstPage = await get('/rooms/search')
        .query({ name: needle.toUpperCase(), page: 1 })
        .expect(200);

      const firstPageBody = firstPage.body as SearchBody;
      expect(firstPageBody.data).toHaveLength(2);
      expect(firstPageBody.meta.total).toBe(2);

      const secondPage = await get('/rooms/search')
        .query({ name: needle, page: 2 })
        .expect(200);

      const secondPageBody = secondPage.body as SearchBody;
      expect(secondPageBody.data).toHaveLength(0);
    });
  });

  describe('Private room authentication', () => {
    it('exchanges the room code for a JWT and protects messages', async () => {
      const room = await createPrivateRoom();

      await post(`/rooms/${room.id}/access`)
        .send({ password: 'ZZZZZZ' })
        .expect(401);

      const token = await getPrivateToken(room.id, 'a1b2c3');

      expect(token).toEqual(expect.any(String));

      await get(`/rooms/${room.id}/messages`).expect(401);
      await get(`/rooms/${room.id}/messages`)
        .query({ token: 'invalid-token' })
        .expect(401);

      const messagesResponse = await get(`/rooms/${room.id}/messages`)
        .query({ token })
        .expect(200);

      expect(messagesResponse.body).toEqual([]);
    });

    it('rejects a token from another room', async () => {
      const roomA = await createPrivateRoom('A1B2C3');
      const roomB = await createPrivateRoom('D4E5F6');
      const tokenForA = await getPrivateToken(roomA.id, 'A1B2C3');

      await get(`/rooms/${roomB.id}/messages`)
        .query({ token: tokenForA })
        .expect(401);
    });

    it('returns 404 when accessing a public or missing room', async () => {
      const publicRoom = await createRoom();

      await post(`/rooms/${publicRoom.id}/access`)
        .send({ password: 'A1B2C3' })
        .expect(404);

      await post(`/rooms/${randomUUID()}/access`)
        .send({ password: 'A1B2C3' })
        .expect(404);
    });

    it('allows reading public messages without a token', async () => {
      const room = await createRoom();

      const response = await get(`/rooms/${room.id}/messages`).expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('Realtime messages', () => {
    it('joins a room and broadcasts a persisted message over websocket', async () => {
      const room = await createRoom();
      const socket = await connectSocket(sessionToken);

      try {
        const historyPromise = once<unknown[]>(socket, 'message-history');
        socket.emit('join-room', { roomId: room.id });

        const history = await historyPromise;
        expect(history).toEqual([]);

        const replyPromise = once<{ success: boolean; id?: string }>(
          socket,
          'reply',
        );
        const messagePromise = once<{
          id: string;
          roomId: string;
          content: string;
        }>(socket, 'new-message');

        socket.emit('send-message', {
          roomId: room.id,
          content: 'hola desde socket',
        });

        const [reply, newMessage] = await Promise.all([
          replyPromise,
          messagePromise,
        ]);

        expect(reply.success).toBe(true);
        expect(reply.id).toEqual(expect.any(String));
        expect(newMessage).toMatchObject({
          roomId: room.id,
          content: 'hola desde socket',
        });

        const messagesResponse = await get(`/rooms/${room.id}/messages`).expect(
          200,
        );

        const messages = messagesResponse.body as MessageBody[];
        expect(
          messages.some((message) => message.content === 'hola desde socket'),
        ).toBe(true);

        // A room with messages must be deletable (ChatItem has a Restrict FK).
        await del(`/rooms/${room.id}`).expect(200);
        await get(`/rooms/${room.id}`).expect(404);
      } finally {
        socket.disconnect();
      }
    });

    it('rate limits message bursts per anonymous session', async () => {
      const room = await createRoom();
      const sessionResponse = await request(http).post('/session').expect(200);
      const burstSession = (sessionResponse.body as AccessBody).token;
      const socket = await connectSocket(burstSession);

      try {
        const historyPromise = once<unknown[]>(socket, 'message-history');
        socket.emit('join-room', { roomId: room.id });
        await historyPromise;

        const repliesPromise = new Promise<
          { success: boolean; error?: string }[]
        >((resolve, reject) => {
          const replies: { success: boolean; error?: string }[] = [];
          const timer = setTimeout(() => {
            socket.off('reply', onReply);
            reject(new Error('Timeout waiting for rate-limited replies'));
          }, 5000);

          const onReply = (reply: { success: boolean; error?: string }) => {
            replies.push(reply);
            if (replies.length === 7) {
              clearTimeout(timer);
              socket.off('reply', onReply);
              resolve(replies);
            }
          };

          socket.on('reply', onReply);

          for (let index = 0; index < 7; index += 1) {
            socket.emit('send-message', {
              roomId: room.id,
              content: `burst ${index}`,
            });
          }
        });

        const replies = await repliesPromise;
        expect(replies.filter((reply) => reply.success)).toHaveLength(5);
        expect(
          replies.filter((reply) => reply.error === 'RATE_LIMITED'),
        ).toHaveLength(2);
      } finally {
        socket.disconnect();
      }
    });

    it('refuses to send a message before joining the room', async () => {
      const room = await createRoom();
      const socket = await connectSocket(sessionToken);

      try {
        const replyPromise = once<{ success: boolean; error?: string }>(
          socket,
          'reply',
        );

        socket.emit('send-message', {
          roomId: room.id,
          content: 'not joined',
        });

        const reply = await replyPromise;
        expect(reply.success).toBe(false);
        expect(reply.error).toBe('Not joined to room');
      } finally {
        socket.disconnect();
      }
    });
  });

  describe('Files (S3 is the only external service replaced)', () => {
    it('generates upload and download URLs through the external S3 boundary', async () => {
      const room = await createRoom();

      const uploadResponse = await post(`/rooms/${room.id}/upload-urls`)
        .send({
          files: [
            {
              name: 'photo.jpg',
              contentType: 'image/jpeg',
              size: 1024,
            },
          ],
        })
        .expect(201);

      const uploadBody = uploadResponse.body as UploadUrlsBody;
      expect(uploadBody.files).toHaveLength(1);
      expect(uploadBody.files[0]).toMatchObject({
        url: 'https://s3.test/upload',
      });
      expect(uploadBody.files[0].fields.key).toContain(`rooms/${room.id}/`);

      const downloadResponse = await get('/files/download-url')
        .query({ key: 'rooms/test/file' })
        .expect(200);

      const downloadBody = downloadResponse.body as DownloadUrlBody;
      expect(downloadBody.url).toBe(
        `https://s3.test/download/${encodeURIComponent('rooms/test/file')}`,
      );
    });

    it('protects upload URLs and file records for private rooms', async () => {
      const room = await createPrivateRoom();
      const token = await getPrivateToken(room.id);

      await post(`/rooms/${room.id}/upload-urls`)
        .send({
          files: [
            { name: 'doc.pdf', contentType: 'application/pdf', size: 1024 },
          ],
        })
        .expect(401);

      await post(`/rooms/${room.id}/upload-urls`)
        .query({ token })
        .send({
          files: [
            { name: 'doc.pdf', contentType: 'application/pdf', size: 1024 },
          ],
        })
        .expect(201);

      const file = {
        key: 'rooms/test/doc.pdf',
        fileName: 'doc.pdf',
        mimeType: 'application/pdf',
        size: 1024,
      };

      await post(`/rooms/${room.id}/files`)
        .send({ roomId: room.id, files: [file] })
        .expect(401);

      await post(`/rooms/${room.id}/files`)
        .query({ token })
        .send({ roomId: room.id, files: [file] })
        .expect(201);

      const messagesResponse = await get(`/rooms/${room.id}/messages`)
        .query({ token })
        .expect(200);

      const messages = messagesResponse.body as MessageBody[];
      expect(messages[0]).toMatchObject({
        fileName: 'doc.pdf',
        mimeType: 'application/pdf',
      });
    });

    it('validates upload DTOs', async () => {
      const room = await createRoom();

      await post(`/rooms/${room.id}/upload-urls`)
        .send({
          files: [
            {
              name: 'too-big.bin',
              contentType: 'application/octet-stream',
              size: 5 * 1024 * 1024 + 1,
            },
          ],
        })
        .expect(400);

      await post(`/rooms/${room.id}/upload-urls`)
        .send({ files: [{ contentType: 'image/png', size: 10 }] })
        .expect(400);
    });
  });
});

function connectSocket(sessionToken: string): Promise<Socket> {
  const wsPort = process.env.WS_PORT ?? '3002';

  return new Promise((resolve, reject) => {
    const socket = io(`http://localhost:${wsPort}`, {
      auth: { sessionToken },
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
      timeout: 5000,
    });

    socket.once('connect', () => resolve(socket));
    socket.once('connect_error', (error) => {
      socket.disconnect();
      reject(error);
    });
  });
}

function once<T>(socket: Socket, event: string, timeoutMs = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`Timeout waiting for websocket event "${event}"`));
    }, timeoutMs);

    const handler = (payload: T) => {
      clearTimeout(timer);
      resolve(payload);
    };

    socket.once(event, handler);
  });
}
