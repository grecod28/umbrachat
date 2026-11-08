# Testing

Guía para ejecutar la suite localmente y entender qué corre en CI.

## Estrategia

- **API**: Jest + Supertest contra una instancia NestJS real (`AppModule`), PostgreSQL real, migraciones reales, `PrismaService` real, bcrypt/JWT reales y limpieza de tablas entre tests.
- **Web**: Playwright contra `next build` + `next start`, conectado al API real levantado por Playwright, con PostgreSQL real.
- **S3**: es el único servicio externo de pago reemplazado en la suite de API. No hay mocks de repositorios, servicios de dominio, controladores, guards, JWT, bcrypt ni base de datos.
- **Login/registro**: esta aplicación **no tiene** usuarios ni login/registro. La “autenticación” real del producto es el **código de 6 caracteres de una sala privada**, que se canjea por un JWT. La suite cubre ese flujo completo.

## Requisitos

- Node.js 24 (el CI usa 24.16.0 y el VPS también usa Node 24).
- pnpm 9.
- Docker Desktop / Docker Engine para PostgreSQL.

## 1. Base de datos de test

`pnpm test`, `pnpm test:api`, `pnpm test:web` y `pnpm test:e2e` se encargan de todo:

1. Crean `.env.test` desde `.env.test.example` si no existe.
2. Levantan PostgreSQL con `docker compose -f docker-compose.test.yml up -d --wait`.
3. Aplican `prisma migrate deploy`.

Si querés personalizar la conexión, creá tu propio `.env.test` antes de ejecutar los tests. El nombre de la base **debe terminar en `_test`**; los scripts se niegan a migrar o testear contra la base de desarrollo.

Comandos explícitos, si los necesitás:

```bash
pnpm db:test:up
pnpm db:test:migrate
pnpm db:test:down
```

La base queda en `localhost:5433/umbrachat_test`.

## 2. Preparar dependencias, Prisma, migraciones y builds

```bash
pnpm install
pnpm --filter @repo/database db:generate
pnpm test:build
```

`pnpm test:build` compila:

- `packages/shared`
- `apps/api`
- `apps/web` con `NEXT_PUBLIC_API_URL=http://localhost:3001` y `NEXT_PUBLIC_SOCKET_URL=http://localhost:3002`

No uses `pnpm build` para e2e si tu `.env.production` local apunta a producción: el script `build:e2e` fuerza las URLs locales.

## 3. Backend (integración/e2e real)

```bash
pnpm test:api
```

El script levanta PostgreSQL si hace falta, aplica migraciones y después ejecuta `jest --config ./test/jest-e2e.json` con:

- PostgreSQL real
- migraciones aplicadas con `prisma migrate deploy`
- `TRUNCATE` de tablas antes de cada test
- HTTP real con Supertest
- WebSocket real para `join-room`, `send-message`, `new-message` y `reply`

Cobertura principal:

- CRUD de salas y validación de DTOs.
- Búsqueda pública, paginación y conteo correcto.
- Sala privada: código incorrecto, JWT, token de otra sala, lectura de mensajes protegida.
- 404/401/400.
- Persistencia real de mensajes y borrado de una sala con mensajes.
- Upload/download URLs y registros de archivos (S3 reemplazado).
- WebSocket: historial, envío, broadcast y envío sin unirse.
- Sesión anónima obligatoria para escrituras HTTP y handshake WebSocket.
- Rate limit por IP y por sesión (HTTP) y ráfagas de mensajes (WebSocket).

Reportes:

- `apps/api/test-results/api-results.json`
- `apps/api/test-results/coverage/`

## 4. Frontend (Playwright contra builds reales)

```bash
pnpm --filter web exec playwright install chromium
pnpm test:web
```

`playwright.config.ts` levanta automáticamente:

1. Migraciones contra la base de test.
2. `apps/api` con `node dist/main`.
3. `apps/web` con `next start`.

Cubre:

- Navegación pública: Home, Info, Contact, Chats.
- Búsqueda real de salas creadas por API.
- Creación de sala pública, envío de mensaje real y eliminación desde la UI.
- Creación de sala privada, código incorrecto y acceso con JWT.
- Validación del formulario privado antes de llamar al API.
- Persistencia del tema Papel/Noche y cambio de idioma.

No hay `page.route` ni MSW en estos flujos.

Reportes y artefactos:

- `apps/web/playwright-report/`
- `apps/web/test-results/` (trazas, screenshots y videos en fallos)

## Todo junto

```bash
pnpm test:e2e
```

Turbo ejecuta los paquetes de forma secuencial (`--concurrency=1`) para que el API de tests y el API de Playwright no compartan puertos.

También existe `pnpm test`, que corre la suite e2e del API y los tests de componentes de web. La suite que bloquea el deploy es la de `test:e2e`.

## Variables de entorno

`.env.test` (local) / variables del job (CI):

| Variable | Uso |
|---|---|
| `DATABASE_URL` | PostgreSQL de test |
| `JWT_SECRET` | Firma/verificación de JWT de salas y sesiones anónimas |
| `THROTTLE_LIMIT` | Límite IP heredado; se mantiene por compatibilidad |
| `IP_THROTTLE_LIMIT` | Límite HTTP por IP en la suite (alto) |
| `SESSION_THROTTLE_LIMIT` | Límite HTTP por sesión anónima en la suite (alto) |
| `THROTTLE_BLOCK_MS` | Duración del bloqueo al superar un límite |
| `WS_PORT` | API tests en `3102`; Playwright/API real en `3002` |
| `AWS_S3_BUCKET_NAME`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Solo para construir `S3Service`; S3 está stubbeado en API tests |
| `E2E_API_URL` | URL del API para Playwright |
| `PLAYWRIGHT_BASE_URL` | URL del frontend para Playwright |
| `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL` | Se usan al compilar el web de e2e |

Los tests **no necesitan secretos de AWS ni de VPS**. Los secretos `VPS_*` siguen siendo exclusivos del deploy.

## Migraciones y producción

El repo no tenía migraciones; se agregó la migración inicial `20261028000000_init` generada desde el schema real.

- CI/test usa `prisma migrate deploy`.
- `deploy/deploy.sh` **sigue usando `prisma db push`** porque no se modificó la lógica de despliegue.
- Si más adelante querés que producción use migraciones, hay que baselinar la base existente:

```bash
pnpm --filter @repo/database exec prisma migrate resolve \
  --applied 20261028000000_init
```

Después de eso, recién ahí se puede cambiar el deploy a `prisma migrate deploy`.

## Limpieza local

```bash
docker compose -f docker-compose.test.yml down -v
rm .env.test
```

## Qué necesito si querés ampliar los tests concretos

La base ya cubre los módulos y rutas que existen hoy. Para escribir más casos necesito que me pegues:

1. Si existe otro sistema de autenticación/usuarios fuera de este repo: controladores, guards, modelo Prisma y endpoints de login/registro.
2. Endpoints administrativos, de moderación o de pagos (no están en este código).
3. Si querés probar S3 real: bucket de test, política de lifecycle y credenciales de test (servicio pago externo).
4. Si el formulario de contacto (Formspree) debe testearse de verdad: endpoint/credencial de test.
5. Contratos exactos de WebSocket que quieras validar como obligatorios (por ejemplo, forma del evento `exception` al entrar a una sala privada sin token).
6. Cualquier módulo nuevo que no esté en `apps/api/src/modules` o página nueva fuera de `apps/web/app`.
