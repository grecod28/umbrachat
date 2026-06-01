# UmbraChat API

Backend del proyecto UmbraChat. API REST + WebSockets para un sistema de chat en tiempo real con soporte de salas públicas y privadas.

## Stack

- **Framework:** NestJS 11
- **Base de datos:** PostgreSQL + Prisma ORM
- **Tiempo real:** Socket.IO (WebSockets)
- **Auth:** JWT (para acceso a salas privadas)
- **Validación:** class-validator + class-transformer
- **Tareas programadas:** @nestjs/schedule (limpieza de mensajes cada hora)

## Arquitectura

```
HTTP (puerto 3001) ──── RoomsController (CRUD de salas)
                          ├── GET    /rooms          → Obtener salas por IDs
                          ├── GET    /rooms/search    → Buscar salas públicas (paginado)
                          ├── GET    /rooms/:id       → Obtener una sala
                          ├── GET    /rooms/:id/messages → Mensajes de una sala
                          ├── POST   /rooms           → Crear sala (pública o privada)
                          ├── POST   /rooms/:id/access → Obtener token JWT (salas privadas)
                          └── DELETE /rooms/:id       → Eliminar sala

WS   (puerto 3002) ──── ChatGateway (eventos en tiempo real)
                          ├── join-room       → Unirse a una sala
                          ├── leave-room      → Salir de una sala
                          ├── send-message    → Enviar mensaje
                          ├── message-history → Historial al unirse (server → client)
                          ├── new-message     → Nuevo mensaje broadcast (server → client)
                          └── room-update     → Actualización de usuarios (server → client)
```

## Módulos

```
AppModule
├── ConfigModule       → Variables de entorno (global)
├── PrismaModule       → Conexión a base de datos
│   └── PrismaService  → Wrapper de PrismaClient (Pg adapter)
├── AuthModule         → JWT signing/verification
│   └── JwtModule
└── ChatModule
    ├── ChatGateway        → Eventos WebSocket
    ├── RoomsModule
    │   ├── RoomsController → Endpoints HTTP
    │   └── RoomsService    → Lógica de salas
    └── MessagesModule
        ├── MessagesService → CRUD de mensajes
        └── TasksService    → Cron: limpieza de mensajes viejos
```

## Primeros pasos

```bash
# 1. Instalar dependencias (desde la raíz del monorepo)
pnpm install

# 2. Configurar variables de entorno
#    Crear o editar .env en la raíz del proyecto con:
#    DATABASE_URL=postgresql://...
#    JWT_SECRET=...
#    PORT=3001

# 3. Inicializar base de datos
cd packages/database
pnpm prisma generate
pnpm prisma db push
cd ../../apps/api

# 4. Iniciar en modo desarrollo
pnpm start:dev
```

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | Requerida |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | Requerida |
| `PORT` | Puerto del servidor HTTP | `3001` |

## Endpoints HTTP

### `GET /rooms`
Obtiene múltiples salas por sus IDs.

**Query params:**
- `ids` — Array de UUIDs (se pasa como `?ids=a&ids=b`)

**Respuesta:** Array de salas con campo `isPrivate`.

### `GET /rooms/search`
Busca salas públicas por nombre (case-insensitive).

**Query params:**
- `name` — Término de búsqueda (requerido, max 120 chars)
- `page` — Número de página (opcional, default 1)

**Respuesta:**
```json
{
  "data": [ { "id": "...", "name": "...", "description": "...", "createdAt": "...", "lastMessageAt": "..." } ],
  "meta": { "total": 10, "lastPage": 1 }
}
```

### `GET /rooms/:id`
Obtiene una sala por su UUID.

**Respuesta:** Sala con campo `isPrivate`.

### `GET /rooms/:id/messages`
Obtiene los mensajes de una sala.

**Query params:**
- `token` — Token JWT (requerido si la sala es privada)

**Respuesta:** Array de mensajes ordenados por `createdAt ASC`.

### `POST /rooms`
Crea una nueva sala.

**Body:**
```json
{
  "name": "Mi sala",
  "description": "Opcional",
  "visibility": "PUBLIC" | "PRIVATE",
  "password": "123456"
}
```

> El campo `password` es obligatorio si `visibility` es `PRIVATE`. Debe tener exactamente 6 caracteres. Se almacena hasheado con bcrypt.

### `POST /rooms/:id/access`
Genera un token JWT para acceder a una sala privada.

**Body:**
```json
{ "password": "123456" }
```

**Respuesta (200):**
```json
{ "token": "eyJhbGciOiJIUzI1NiIs..." }
```

> El token expira en 2 horas y contiene el `roomId` en el payload.

### `DELETE /rooms/:id`
Elimina una sala (cascade a `RoomAccess`).

## WebSockets

### Conexión

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:3002", {
  transports: ["websocket", "polling"],
});
```

### Eventos cliente → servidor

#### `join-room`
```ts
socket.emit("join-room", {
  roomId: "uuid-de-la-sala",
  token: "jwt-opcional-para-salas-privadas",
});
```

#### `leave-room`
```ts
socket.emit("leave-room", { roomId: "uuid-de-la-sala" });
```

#### `send-message`
```ts
socket.emit("send-message", {
  roomId: "uuid",
  content: "Texto del mensaje (máx 2048 chars)",
});
```

### Eventos servidor → cliente

| Evento | Payload | Cuándo ocurre |
|--------|---------|---------------|
| `message-history` | `Message[]` | Al unirse a una sala |
| `new-message` | `Message` | Cada vez que alguien envía un mensaje |
| `reply` | `{ success, error? }` | Confirmación de `send-message` |
| `room-update` | `{ event, usersInRoom }` | Al unirse/salir/desconectarse |

## Modelo de datos

```prisma
model Room {
  id            String      @id @default(uuid())
  name          String      @default("Untitled Chat") @db.VarChar(120)
  description   String      @default("") @db.VarChar(2048)
  createdAt     DateTime    @default(now())
  lastMessageAt DateTime    @default(now())
  messages      Message[]
  access        RoomAccess?
}

model RoomAccess {
  roomId       String @id
  passwordHash String @db.VarChar(255)
  room         Room   @relation(fields: [roomId], references: [id], onDelete: Cascade)
}

model Message {
  id        String   @id @default(uuid())
  content   String
  roomId    String
  createdAt DateTime @default(now())
  room      Room     @relation(fields: [roomId], references: [id])
}
```

## Seguridad

- Las contraseñas de salas privadas se almacenan hasheadas con **bcrypt** (no en texto plano).
- El acceso a salas privadas via WebSocket requiere un token **JWT** firmado con `JWT_SECRET`.
- El token JWT tiene expiración de **2 horas** y está vinculado al `roomId`.
- Solo las salas sin `RoomAccess` asociado son públicas y se devuelven en búsquedas.
- `ValidationPipe` global con `whitelist: true` — las propiedades no declaradas en los DTOs se eliminan automáticamente.

## Tareas programadas

| Tarea | Frecuencia | Descripción |
|-------|-----------|-------------|
| `handleMessageCleanup` | Cada hora | Elimina mensajes con más de 24 horas de antigüedad |

## Scripts disponibles

```bash
pnpm start:dev    # Desarrollo con hot-reload
pnpm start        # Producción
pnpm build        # Compilar a JS
pnpm test         # Tests unitarios
pnpm test:e2e     # Tests end-to-end
pnpm lint         # ESLint
```
