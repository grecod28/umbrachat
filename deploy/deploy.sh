#!/usr/bin/env bash
#
# Despliegue de UmbraChat en el VPS (main -> build -> Prisma -> PM2).
#
# Se ejecuta desde GitHub Actions por SSH, pero también se puede lanzar a mano:
#   cd /var/www/umbrachat && bash deploy/deploy.sh
#
# Variables opcionales:
#   APP_DIR          Ruta del repositorio           (default: /var/www/umbrachat)
#   BRANCH           Rama a desplegar               (default: main)
#   WEB_PORT         Puerto de Next.js              (default: 3000)
#   API_PORT         Puerto de NestJS               (default: 3001)
#   SOCKET_PORT      Puerto de Socket.IO            (default: 3002)
#   NODE_HEAP        Memoria máxima para el build   (default: 2048 MB)
#   START_DB         Levantar PostgreSQL con Docker (default: 1)
#   HEALTH_ATTEMPTS  Intentos de healthcheck        (default: 15)
#   HEALTH_DELAY     Segundos entre intentos        (default: 2)

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/umbrachat}"
BRANCH="${BRANCH:-main}"
WEB_PORT="${WEB_PORT:-3000}"
API_PORT="${API_PORT:-3001}"
SOCKET_PORT="${SOCKET_PORT:-3002}"
NODE_HEAP="${NODE_HEAP:-2048}"
START_DB="${START_DB:-1}"
HEALTH_ATTEMPTS="${HEALTH_ATTEMPTS:-20}"
HEALTH_DELAY="${HEALTH_DELAY:-3}"

# El build de Next se hace con la web detenida y sin caché de Turborepo.
# Así nunca se sirve un .next mezclado entre dos builds distintos.
BUILD_TOUCHED=0
BUILD_OK=0

if [ -t 1 ]; then
  BLUE='\033[1;34m'
  RED='\033[1;31m'
  GREEN='\033[1;32m'
  YELLOW='\033[1;33m'
  RESET='\033[0m'
else
  BLUE=''; RED=''; GREEN=''; YELLOW=''; RESET=''
fi

log()  { printf '\n%b[deploy]%b %s\n' "$BLUE" "$RESET" "$*"; }
warn() { printf '%b[deploy] AVISO:%b %s\n' "$YELLOW" "$RESET" "$*"; }
ok()   { printf '%b[deploy] OK:%b %s\n' "$GREEN" "$RESET" "$*"; }
fail() { printf '%b[deploy] ERROR:%b %s\n' "$RED" "$RESET" "$*" >&2; exit 1; }

# Evita que corepack pregunte si debe descargar la versión de pnpm.
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
export TURBO_TELEMETRY_DISABLED=1
export NEXT_TELEMETRY_DISABLED=1
export CI=1

# ---------------------------------------------------------------------------
# Comprobaciones previas
# ---------------------------------------------------------------------------
[ -d "$APP_DIR" ] || fail "No existe el directorio $APP_DIR"
cd "$APP_DIR"

for cmd in git node pnpm pm2 curl; do
  command -v "$cmd" >/dev/null 2>&1 || fail "No se encontró '$cmd' en el PATH del usuario $(whoami)"
done

node_major="$(node -p 'process.versions.node.split(".")[0]')"
node_minor="$(node -p 'process.versions.node.split(".")[1]')"
# El monorepo importa paquetes workspace que apuntan a TypeScript (por ejemplo
# @repo/database). Node 22.18+ lo soporta de forma nativa.
if [ "$node_major" -lt 22 ] || { [ "$node_major" -eq 22 ] && [ "$node_minor" -lt 18 ]; }; then
  fail "Se requiere Node.js 22.18 o superior. Versión actual: $(node -v)"
fi

[ -s ".env" ] || fail "Falta $APP_DIR/.env (variables de la API y Prisma)"
[ -s "apps/web/.env.production" ] || fail "Falta $APP_DIR/apps/web/.env.production (variables NEXT_PUBLIC_*)"

require_var() {
  local file="$1" key="$2"
  grep -qE "^[[:space:]]*(export[[:space:]]+)?${key}=[\"']?[^[:space:]\"']+" "$file" \
    || fail "Falta la variable $key (o está vacía) en $file"
}

for key in DB_USER DB_PASSWORD DB_NAME DATABASE_URL JWT_SECRET AWS_S3_BUCKET_NAME AWS_REGION AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY; do
  require_var ".env" "$key"
done

for key in NEXT_PUBLIC_API_URL NEXT_PUBLIC_SOCKET_URL; do
  require_var "apps/web/.env.production" "$key"
done

[ -f "ecosystem.config.js" ] || fail "Falta ecosystem.config.js"

available_kb="$(df -Pk "$APP_DIR" | awk 'NR==2 {print $4}')"
available_kb="${available_kb:-0}"
if [ "$available_kb" -lt 1048576 ]; then
  fail "Espacio libre insuficiente en $APP_DIR: $((available_kb / 1024)) MB. Se requieren al menos 1024 MB."
fi

available_inodes="$(df -Pi "$APP_DIR" | awk 'NR==2 {print $4}')"
available_inodes="${available_inodes:-0}"
if [ "$available_inodes" -lt 10000 ]; then
  fail "Inodos libres insuficientes en $APP_DIR: $available_inodes. Se requieren al menos 10000."
fi

# Limpieza best-effort de builds anteriores apartados por permisos.
for stale_next in apps/web/.next.old.*; do
  [ -d "$stale_next" ] || continue
  if rm -rf "$stale_next" 2>/dev/null; then
    log "Eliminado build anterior: $stale_next"
  else
    warn "No se pudo eliminar $stale_next (permisos); se puede borrar con sudo."
  fi
done

PREVIOUS_COMMIT="$(git rev-parse HEAD)"
log "Commit actual: $PREVIOUS_COMMIT"
log "Directorio: $APP_DIR | Rama: $BRANCH"

# ---------------------------------------------------------------------------
# Rollback best-effort si algo falla después de este punto
# ---------------------------------------------------------------------------
ROLLBACK_DONE=0

build_all() {
  BUILD_TOUCHED=1
  BUILD_OK=0

  local old_next=""

  # Un .next viejo mezclado con un build nuevo produce manifiestos que apuntan
  # a chunks inexistentes (la web devuelve 500 en /_next/static/*).
  #
  # No borramos el directorio: si Next generó cache de imágenes con otro
  # usuario, rm falla por permisos. Moverlo solo requiere permiso sobre
  # apps/web, no sobre cada archivo interno.
  if [ -e apps/web/.next ] || [ -L apps/web/.next ]; then
    old_next="apps/web/.next.old.$(date +%s).$$.$RANDOM"
    if ! mv apps/web/.next "$old_next"; then
      fail "No se pudo apartar apps/web/.next"
    fi
    log "Build anterior apartado en $old_next"
  fi

  if ! NODE_OPTIONS="--max-old-space-size=${NODE_HEAP}" pnpm build --force; then
    fail "Falló el build de web/api"
  fi

  local chunk_count
  chunk_count="$(find apps/web/.next/static/chunks -type f -name '*.js' 2>/dev/null | wc -l | tr -d ' ')"
  chunk_count="${chunk_count:-0}"

  if [ "$chunk_count" -lt 5 ]; then
    fail "El build de web generó ${chunk_count} chunks JS; el artefacto está incompleto."
  fi

  if [ -n "$old_next" ] && [ -d "$old_next" ]; then
    if rm -rf "$old_next" 2>/dev/null; then
      log "Build anterior eliminado"
    else
      warn "No se pudo borrar $old_next por permisos. Queda en disco; se puede limpiar con sudo."
    fi
  fi

  BUILD_OK=1
}

on_error() {
  local exit_code=$?

  trap - ERR
  set +e

  if [ "$ROLLBACK_DONE" -eq 1 ]; then
    exit "$exit_code"
  fi
  ROLLBACK_DONE=1

  printf '\n%b[deploy] Falló el despliegue (código %s). Intentando volver a %s...%b\n' \
    "$RED" "$exit_code" "$PREVIOUS_COMMIT" "$RESET" >&2

  cd "$APP_DIR" || exit "$exit_code"

  current_commit="$(git rev-parse HEAD)"
  if [ "$current_commit" != "$PREVIOUS_COMMIT" ] \
    || { [ "$BUILD_TOUCHED" -eq 1 ] && [ "$BUILD_OK" -ne 1 ]; }; then
    git checkout -f -B "$BRANCH" "$PREVIOUS_COMMIT" || exit "$exit_code"
    pnpm install --frozen-lockfile --prod=false --prefer-offline || exit "$exit_code"
    pnpm --filter @repo/database db:generate || exit "$exit_code"
    build_all
  fi

  pm2 startOrReload "$APP_DIR/ecosystem.config.js" --update-env || exit "$exit_code"
  pm2 save || exit "$exit_code"

  printf '%b[deploy] Rollback completado. Revisar logs con: pm2 logs%b\n' "$YELLOW" "$RESET" >&2
  exit "$exit_code"
}

trap on_error ERR

# ---------------------------------------------------------------------------
# Código
# ---------------------------------------------------------------------------
log "Descargando cambios de origin/$BRANCH"
git fetch --prune origin "$BRANCH"
git checkout -f -B "$BRANCH" "origin/$BRANCH"
git reset --hard "origin/$BRANCH"
NEW_COMMIT="$(git rev-parse HEAD)"

if [ "$PREVIOUS_COMMIT" = "$NEW_COMMIT" ]; then
  warn "No hay cambios de código; se recompila igual para asegurar el estado."
else
  log "Desplegando $NEW_COMMIT"
fi

# ---------------------------------------------------------------------------
# PostgreSQL (contenedor definido en docker-compose.yml)
# ---------------------------------------------------------------------------
compose_cmd=()
if [ "$START_DB" = "1" ] && command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then
    compose_cmd=(docker compose)
  elif command -v docker-compose >/dev/null 2>&1; then
    compose_cmd=(docker-compose)
  fi

  if [ "${#compose_cmd[@]}" -gt 0 ]; then
    log "Levantando PostgreSQL"
    if ! "${compose_cmd[@]}" up -d db; then
      warn "No se pudo levantar el contenedor de PostgreSQL; se usará la base ya existente."
    fi

    db_user="$(grep -E '^[[:space:]]*DB_USER=' .env | tail -n1 | cut -d= -f2- || true)"
    db_user="${db_user:-postgres}"
    for _ in $(seq 1 20); do
      if "${compose_cmd[@]}" exec -T db pg_isready -U "$db_user" >/dev/null 2>&1; then
        ok "PostgreSQL listo"
        break
      fi
      sleep 2
    done
  fi
else
  warn "START_DB=$START_DB: no se gestiona el contenedor de PostgreSQL desde el deploy."
fi

# ---------------------------------------------------------------------------
# Dependencias y build
# ---------------------------------------------------------------------------
log "Instalando dependencias (pnpm)"
pnpm install --frozen-lockfile --prod=false --prefer-offline

log "Generando Prisma Client"
pnpm --filter @repo/database db:generate

log "Deteniendo web para reconstruir .next de forma limpia"
pm2 stop umbra-web >/dev/null 2>&1 || true

log "Compilando web + api (Turborepo, sin caché)"
build_all

# ---------------------------------------------------------------------------
# Esquema de base de datos
# ---------------------------------------------------------------------------
log "Sincronizando esquema con Prisma (db push)"
# Sin --accept-data-loss: si un cambio exige borrar datos, el deploy falla y
# hay que resolverlo manualmente. CI=1 evita que Prisma quede esperando input.
pnpm --filter @repo/database exec prisma db push

# ---------------------------------------------------------------------------
# PM2
# ---------------------------------------------------------------------------
reload_pm2() {
  pm2 startOrReload "$APP_DIR/ecosystem.config.js" --update-env
  pm2 save
}

log "Recargando procesos en PM2"
reload_pm2

# ---------------------------------------------------------------------------
# Healthcheck
# ---------------------------------------------------------------------------
http_ok() {
  curl -fsS --max-time 5 -o /dev/null "$1"
}

web_routes_ok() {
  local route
  for route in "/" "/es/chat/search" "/es/config/language"; do
    if ! http_ok "http://127.0.0.1:${WEB_PORT}${route}"; then
      printf '  ruta fallida: %s\n' "$route"
      return 1
    fi
  done
}

web_assets_ok() {
  local html paths asset_path
  html="$(curl -fsSL --max-time 5 "http://127.0.0.1:${WEB_PORT}/" || return 1)"
  paths="$(printf '%s' "$html" | grep -oE '/_next/static/[^"<> ]+\.(js|css)' | sort -u | head -n 12 || true)"

  if [ -z "$paths" ]; then
    printf '  no se encontraron assets /_next/static en el HTML\n'
    return 1
  fi

  while IFS= read -r asset_path; do
    [ -n "$asset_path" ] || continue
    if ! http_ok "http://127.0.0.1:${WEB_PORT}${asset_path}"; then
      printf '  asset fallido: %s\n' "$asset_path"
      return 1
    fi
  done <<< "$paths"
}

log "Verificando servicios y assets estáticos"
healthy=0
for attempt in $(seq 1 "$HEALTH_ATTEMPTS"); do
  if http_ok "http://127.0.0.1:${WEB_PORT}/" \
    && http_ok "http://127.0.0.1:${API_PORT}/api/docs-json" \
    && http_ok "http://127.0.0.1:${SOCKET_PORT}/socket.io/?EIO=4&transport=polling" \
    && web_routes_ok \
    && web_assets_ok; then
    healthy=1
    break
  fi
  printf '  intento %s/%s...\n' "$attempt" "$HEALTH_ATTEMPTS"
  sleep "$HEALTH_DELAY"
done

if [ "$healthy" -ne 1 ]; then
  printf '%b[deploy] ERROR:%b Los servicios no respondieron correctamente (web:%s, api:%s, socket:%s)\n' \
    "$RED" "$RESET" "$WEB_PORT" "$API_PORT" "$SOCKET_PORT" >&2
  # `false` dispara el trap de rollback (un `exit` no lo haría).
  false
fi

ok "Healthcheck correcto (web:${WEB_PORT}, api:${API_PORT}, socket:${SOCKET_PORT})"
pm2 list
log "Despliegue completado: $NEW_COMMIT"
