# UmbraChat

Aplicación de chat en tiempo real con soporte de salas públicas y privadas. Construida con Next.js 16, NestJS 11, PostgreSQL y Socket.IO.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 16 (React 19, Turbopack, Tailwind CSS v4) |
| **Backend** | NestJS 11 (REST + WebSockets) |
| **Base de datos** | PostgreSQL 15 + Prisma ORM 7 |
| **Tiempo real** | Socket.IO |
| **Auth** | JWT (acceso a salas privadas) |
| **Idiomas** | next-intl (español, inglés) |
| **Monorepo** | pnpm workspaces + Turborepo |
| **Lenguaje** | TypeScript 6 |

## Requisitos

- **Node.js** >= 18
- **pnpm** >= 9
- **Docker** (para PostgreSQL local)

## Primeros pasos

```bash
# Clonar e instalar dependencias
git clone <repo>
cd umbra
pnpm install

# Iniciar base de datos
docker compose up -d

# Generar Prisma client
pnpm --filter @repo/database db:generate
pnpm --filter @repo/database db:push

# Iniciar en desarrollo (api + web simultáneamente)
pnpm dev
```

El frontend arranca en `http://localhost:3000` y la API en `http://localhost:3001`.

## Variables de entorno

### Raíz (`.env`)
| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |

### Web (`apps/web/.env.local`)
| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base de la API REST (`http://localhost:3001`) |
| `NEXT_PUBLIC_SOCKET_URL` | URL del servidor WebSocket (`http://localhost:3002`) |

## Scripts

```bash
pnpm dev           # Iniciar todo en desarrollo
pnpm build         # Compilar todo
pnpm lint          # Lint en todos los paquetes
pnpm check-types   # TypeScript check en todos los paquetes
pnpm format        # Formatear código con Prettier
```

Para ejecutar un solo workspace:
```bash
pnpm --filter web dev
pnpm --filter api start:dev
pnpm --filter @repo/database db:studio
```

## Estructura del proyecto

```
umbra/
├── apps/
│   ├── web/                 # Frontend Next.js
│   │   ├── app/
│   │   │   ├── globals.css           # Tailwind v4 + temas (purple/blue)
│   │   │   ├── proxy.ts              # next-intl middleware
│   │   │   └── [locale]/
│   │   │       ├── layout.tsx        # Layout raíz (fuentes, providers)
│   │   │       ├── (main)/           # Páginas principales
│   │   │       │   ├── page.tsx      # Home
│   │   │       │   ├── contact/      # Página de contacto
│   │   │       │   ├── search/       # Búsqueda de salas
│   │   │       │   └── [...not-found]/
│   │   │       ├── chat/
│   │   │       │   ├── layout.tsx
│   │   │       │   ├── (root)/       # Lista de chats, crear/unirse
│   │   │       │   └── [id]/         # Sala de chat individual
│   │   │       └── config/           # Configuración (idioma, apariencia)
│   │   ├── components/
│   │   │   ├── layout/               # Header, Navbar
│   │   │   ├── chat/                 # ChatCard
│   │   │   └── ui/                   # Select, InputPassword, Pagination
│   │   ├── providers/
│   │   │   ├── shape-provider.tsx    # Tema persistente (font, size, color)
│   │   │   └── socket-provider.tsx   # Conexión Socket.IO
│   │   ├── i18n/                     # next-intl (en, es)
│   │   ├── libs/
│   │   │   ├── constants/            # API URL, shape, languages
│   │   │   ├── functions/            # formatDate, sounds
│   │   │   ├── hooks/                # useTypingSound
│   │   │   ├── socket.ts             # Singleton Socket.IO client
│   │   │   └── types/                # Route, NavbarProps
│   │   └── next.config.ts
│   │
│   └── api/                  # Backend NestJS
│       └── src/
│           ├── main.ts               # Bootstrap
│           ├── app.module.ts         # Módulo raíz
│           ├── prisma/               # PrismaModule + PrismaService
│           ├── auth/                 # JWT Module
│           └── chat/
│               ├── chat.module.ts
│               ├── chat.gateway.ts   # WebSockets (Socket.IO)
│               ├── rooms/            # CRUD de salas + búsqueda
│               │   ├── rooms.controller.ts
│               │   ├── rooms.service.ts
│               │   └── dto/
│               └── messages/
│                   ├── messages.service.ts
│                   ├── tasks.service.ts   # Cron: limpieza de mensajes
│                   └── dto/
│
├── packages/
│   ├── database/             # Prisma ORM
│   │   ├── index.ts          # Re-exporta @prisma/client + RoomWithPrivate
│   │   └── prisma/
│   │       └── schema.prisma # Room, RoomAccess, Message
│   ├── shared/               # Tipos y constantes compartidas
│   │   ├── index.ts
│   │   └── types/chat.ts     # ROOM_VISIBILITY
│   ├── ui/                   # Componentes React compartidos (button, card, code)
│   ├── eslint-config/        # ESLint presets
│   └── typescript-config/    # TSConfig presets
│
├── docker-compose.yml        # PostgreSQL local
├── turbo.json                # Pipeline de build
└── pnpm-workspace.yaml
```

## Frontend (apps/web)

### Páginas

- **`/`** — Home con acceso a crear o unirse a una sala.
- **`/chat`** — Lista de los chats del usuario (almacenados en localStorage).
- **`/chat/create`** — Formulario para crear salas (públicas o privadas con código de 6 caracteres).
- **`/chat/join`** — Formulario para unirse a una sala por enlace.
- **`/chat/:id`** — Sala de chat en tiempo real.
- **`/chat/:id/share`** — Compartir enlace de la sala.
- **`/search`** — Búsqueda de salas públicas por nombre (paginado).
- **`/contact`** — Información de contacto.
- **`/config/language`** — Selector de idioma.
- **`/config/shape`** — Personalización de apariencia (fuente, tamaño, color).

### Sistema de temas

El tema se persiste en localStorage bajo la clave `umbra-shape` y permite:
- **Fuente:** Geist Sans (default) o Geist Mono
- **Tamaño:** sm (14px), md (16px), lg (18px)
- **Color:** Purple (default) o Blue

### Internacionalización

Soporte para inglés (`en`) y español (`es`). La detección de idioma se maneja mediante next-intl middleware (`proxy.ts`).

## Backend (apps/api)

Documentación detallada en [`apps/api/README.md`](./apps/api/README.md).

### APIs principales

| Tipo | Puerto | Descripción |
|------|--------|-------------|
| REST | 3001 | CRUD de salas, búsqueda, acceso a salas privadas |
| WebSocket | 3002 | Mensajes en tiempo real, unirse/salir de salas |

### Endpoints REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/rooms` | Obtener salas por IDs |
| `GET` | `/rooms/search` | Buscar salas públicas (paginado) |
| `GET` | `/rooms/:id` | Obtener una sala |
| `GET` | `/rooms/:id/messages` | Mensajes de una sala |
| `POST` | `/rooms` | Crear sala |
| `POST` | `/rooms/:id/access` | Obtener token JWT para sala privada |
| `DELETE` | `/rooms/:id` | Eliminar sala |

### Eventos WebSocket

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `join-room` | Cliente → Servidor | Unirse a una sala |
| `leave-room` | Cliente → Servidor | Salir de una sala |
| `send-message` | Cliente → Servidor | Enviar mensaje |
| `message-history` | Servidor → Cliente | Historial al unirse |
| `new-message` | Servidor → Cliente | Nuevo mensaje (broadcast) |
| `reply` | Servidor → Cliente | Confirmación de envío |
| `room-update` | Servidor → Cliente | Actualización de usuarios |

## Base de datos

### Modelo

```prisma
model Room {
  id            String      @id @default(uuid())
  name          String      @default("Untitled Chat")
  description   String      @default("")
  createdAt     DateTime    @default(now())
  lastMessageAt DateTime    @default(now())
  messages      Message[]
  access        RoomAccess?    // null = pública, existe = privada
}

model RoomAccess {
  roomId       String @id
  passwordHash String   // bcrypt
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

Las salas privadas se identifican por la presencia de un registro en `RoomAccess`. La contraseña se almacena hasheada con bcrypt. Los mensajes mayores a 24 horas se eliminan automáticamente cada hora.

## Sonidos

El frontend genera efectos de sonido sintéticos mediante Web Audio API:
- **Typing:** Blip corto al escribir en inputs (con throttle de 50ms).
- **Submit:** Tono ascendente al enviar formularios.
- No requiere archivos de audio externos.
