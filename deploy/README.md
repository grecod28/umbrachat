# Despliegue en producción — Hostinger VPS

Guía de publicación de UmbraChat con **GitHub Actions + PM2 + Nginx + PostgreSQL (Docker)**.

## Cómo funciona

```
push a main
   │
   ▼
GitHub Actions (.github/workflows/deploy.yml)
   │  SSH con llave (secret VPS_SSH_KEY)
   ▼
VPS /var/www/umbrachat
   ├─ git fetch + reset a origin/main
   ├─ pnpm install --frozen-lockfile
   ├─ prisma generate
   ├─ pnpm build (web + api)
   ├─ prisma db push
   ├─ pm2 startOrReload (web :3000, api :3001, socket :3002)
   └─ healthcheck de los 3 servicios
```

| Servicio | Proceso PM2 | Puerto local | Dominio |
|----------|-------------|--------------|---------|
| Next.js 16 | `umbra-web` | `127.0.0.1:3000` | `umbrachat.org`, `www.umbrachat.org` |
| NestJS REST | `umbra-api` | `0.0.0.0:3001` | `back.umbrachat.org` |
| Socket.IO | `umbra-api` (gateway) | `0.0.0.0:3002` | `socket.umbrachat.org` |
| PostgreSQL 15 | contenedor `umbra-db` | `127.0.0.1:5432` | — |

Nginx termina TLS y hace de reverse proxy. La base de datos **no** se expone a internet.

---

## 1. Requisitos del VPS

Ubuntu 22.04/24.04, 2 vCPU y 2 GB de RAM como mínimo (4 GB recomendado para compilar Next.js). Node.js **22.18+** (o 24), porque el monorepo importa paquetes workspace que apuntan a TypeScript.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx ufw build-essential python3

# Docker (repositorio oficial, incluye docker compose v2)
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 y pnpm
sudo npm install -g pm2 pnpm@9
```

> `package.json` fija `pnpm@9.0.0`; `pnpm@9` es compatible con ese lockfile.

Si el VPS tiene solo 2 GB de RAM, agregar swap antes de compilar Next.js:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Usuario de despliegue

No conviene desplegar como `root`. Crear un usuario dedicado con acceso a Docker:

```bash
sudo adduser umbra
sudo usermod -aG docker umbra
sudo mkdir -p /var/www/umbrachat
sudo chown -R umbra:umbra /var/www/umbrachat
```

Después iniciar sesión como ese usuario (`su - umbra`).

---

## 2. DNS

Crear registros **A** (y **AAAA** si el VPS tiene IPv6) apuntando a la IP del VPS:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | `@` | IP del VPS |
| A | `www` | IP del VPS |
| A | `back` | IP del VPS |
| A | `socket` | IP del VPS |

Esperar la propagación antes de ejecutar Certbot.

---

## 3. Primer despliegue manual

> **Requisito:** los archivos `deploy/`, `ecosystem.config.js`, `.env.example` y `.github/workflows/deploy.yml` deben estar en `main`. Si se crearon en `dev`, mergear `dev → main` antes de clonar en el VPS.

```bash
git clone https://github.com/grecod28/umbrachat.git /var/www/umbrachat
cd /var/www/umbrachat
git checkout main
```

Si el repositorio es privado, configurar una **deploy key** de solo lectura en GitHub y clonar por SSH.

### Variables de entorno

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.production
nano .env
nano apps/web/.env.production
chmod 600 .env apps/web/.env.production
```

Contenido esperado de `.env` (valores reales, no los del ejemplo):

```dotenv
DB_PORT=5432
DB_NAME=umbrachat
DB_USER=umbrachat
DB_PASSWORD=<password-fuerte>
DATABASE_URL=postgresql://umbrachat:<password-fuerte>@127.0.0.1:5432/umbrachat?schema=public
JWT_SECRET=<secreto-largo-y-aleatorio>
PORT=3001
AWS_S3_BUCKET_NAME=<bucket>
AWS_REGION=<region>
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
```

`apps/web/.env.production`:

```dotenv
NEXT_PUBLIC_API_URL=https://back.umbrachat.org
NEXT_PUBLIC_SOCKET_URL=https://socket.umbrachat.org
```

> **Importante:** las `NEXT_PUBLIC_*` se incrustan en el bundle al compilar. Si cambian, hay que volver a desplegar; el script de deploy siempre compila.
>
> Si `DB_PASSWORD` contiene caracteres especiales (`$`, `#`, `@`, `:`), escaparlos para Docker Compose y URL-encodearlos dentro de `DATABASE_URL`.

> **Compatibilidad de la base:** la rama `main` actual trae un `docker-compose.yml` con credenciales fijas (`postgres` / `mysecretpassword` / `umbrachat`), volumen nombrado `db-data` y el puerto `5432:5432` expuesto. La rama `dev` usa las variables `DB_*`, un bind mount en `./postgres` y publica el puerto solo en `127.0.0.1`. Al mergear `dev → main` queda la versión segura: el `DATABASE_URL` debe coincidir con `DB_USER`, `DB_PASSWORD` y `DB_NAME`.
>
> Si el VPS **ya tiene datos** creados con el compose de `main`, el cambio de volumen `db-data` → `./postgres` hará que PostgreSQL arranque vacío (el volumen viejo no se borra, pero deja de montarse). Antes de mergear, hacer un backup y restaurarlo después del primer deploy:
>
> ```bash
> docker compose exec -T db pg_dump -U postgres umbrachat > backup-antes-de-merge.sql
> # ... merge + deploy ...
> docker compose exec -T db psql -U <DB_USER> -d umbrachat < backup-antes-de-merge.sql
> ```
>
> Si el volumen de PostgreSQL ya existe con otras credenciales, Docker **no** las cambia al reiniciar. Mantener el `DATABASE_URL` con las credenciales originales o cambiar la password del rol manualmente; recrear el volumen implica perder los datos.

### Build inicial y arranque

```bash
docker compose up -d db

pnpm install --frozen-lockfile
pnpm --filter @repo/database db:generate
pnpm build
pnpm --filter @repo/database exec prisma db push

pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u umbra --hp /home/umbra
```

Ejecutar el comando `sudo env PATH=...` que imprime `pm2 startup` para que los procesos se levanten al reiniciar el VPS.

Verificar:

```bash
curl -I http://127.0.0.1:3000
curl -s http://127.0.0.1:3001/api/docs-json | head -c 80
curl -s 'http://127.0.0.1:3002/socket.io/?EIO=4&transport=polling'
```

### Nginx + TLS

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo cp deploy/nginx/umbrachat.conf /etc/nginx/sites-available/umbrachat.conf
sudo ln -sf /etc/nginx/sites-available/umbrachat.conf /etc/nginx/sites-enabled/umbrachat.conf
sudo nginx -t && sudo systemctl reload nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx \
  -d umbrachat.org -d www.umbrachat.org \
  -d back.umbrachat.org -d socket.umbrachat.org
```

Certbot agrega los bloques 443 y la redirección HTTP → HTTPS.

### Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
```

No abrir `3000`, `3001`, `3002` ni `5432`: solo Nginx debe ser accesible desde fuera.

> GitHub Actions se conecta desde IPs dinámicas. No restrinjas el puerto SSH a una IP fija (romperías los deploys); usá autenticación por llave y, opcionalmente, `fail2ban`. Si Hostinger tiene un firewall adicional en el panel, verificá que permita el puerto SSH configurado.

---

## 4. Conectar GitHub Actions con el VPS

### 4.1 Crear una llave SSH para el deploy

En la máquina local (no en el VPS):

```bash
ssh-keygen -t ed25519 -C "github-actions-umbra" -f ~/.ssh/umbra_deploy
```

Copiar la **clave pública** al VPS, como usuario `umbra`:

```bash
ssh-copy-id -i ~/.ssh/umbra_deploy.pub umbra@IP_DEL_VPS
```

O manualmente en `/home/umbra/.ssh/authorized_keys` (permisos `700` para `.ssh` y `600` para el archivo).

Probar:

```bash
ssh -i ~/.ssh/umbra_deploy umbra@IP_DEL_VPS 'echo conexion OK'
```

### 4.2 Cargar los secrets

En **GitHub → Settings → Secrets and variables → Actions → Secrets**:

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | IP o hostname del VPS |
| `VPS_USER` | `umbra` |
| `VPS_PORT` | `22` (si se cambió el puerto SSH, el nuevo) |
| `VPS_SSH_KEY` | contenido completo de `~/.ssh/umbra_deploy` (incluye `BEGIN`/`END`) |
| `VPS_HOST_FINGERPRINT` | huella del host (recomendado, evita MITM) |

Obtener la huella:

```bash
ssh-keyscan -p 22 -t ed25519 IP_DEL_VPS 2>/dev/null | ssh-keygen -lf -
```

Copiar el valor completo, por ejemplo `SHA256:AbCd...`.

Opcional, en **Variables** (no Secrets):

| Variable | Valor |
|----------|-------|
| `VPS_APP_DIR` | `/var/www/umbrachat` (si se usa otra ruta) |

Con GitHub CLI:

```bash
gh secret set VPS_HOST --body "IP_DEL_VPS"
gh secret set VPS_USER --body "umbra"
gh secret set VPS_PORT --body "22"
gh secret set VPS_SSH_KEY < ~/.ssh/umbra_deploy
gh secret set VPS_HOST_FINGERPRINT --body "SHA256:..."
gh variable set VPS_APP_DIR --body "/var/www/umbrachat"
```

---

## 5. Uso diario

1. Desarrollar y probar en `dev`.
2. Mergear `dev → main` (o hacer push directo a `main`).
3. GitHub Actions ejecuta `deploy/deploy.sh` en el VPS.
4. Si el healthcheck falla, el job queda en rojo y hay que revisar los logs.

Para redesplegar manualmente: **Actions → Deploy production → Run workflow**.

También se puede ejecutar a mano en el VPS:

```bash
cd /var/www/umbrachat
bash deploy/deploy.sh
```

> El workflow solo existe una vez que estos archivos llegan a `main`. Mientras se trabaje en `dev`, el push a `dev` **no** despliega nada.

---

## 6. Operación

```bash
pm2 status
pm2 logs umbra-web
pm2 logs umbra-api
pm2 restart umbra-api
pm2 reload ecosystem.config.js --update-env

# PostgreSQL
docker compose ps
docker compose logs -f db
```

### Rollback

El script no revierte automáticamente la base de datos. Para volver a una versión anterior:

```bash
git revert <commit-malo>
git push origin main
```

El push dispara un nuevo deploy. Si el problema es solo la base, restaurar un backup.

### Backups

```bash
# Backup manual
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backup-$(date +%F).sql
```

Programar un cron diario y guardar los backups fuera del VPS.

### Logs de PM2

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 20M
pm2 set pm2-logrotate:retain 14
```

### Notas importantes

- **Una sola instancia por proceso.** Socket.IO guarda las salas en memoria; para escalar horizontalmente haría falta el adapter de Redis.
- **`prisma db push`** se ejecuta sin `--accept-data-loss`. Si un cambio de esquema exige borrar datos, el deploy falla a propósito y hay que resolverlo a mano.
- **No ejecutar `git clean -fdx`** en el VPS: en la versión de `dev` los datos de PostgreSQL viven en `./postgres` (ignorado por git).
- Durante el build de Next.js el sitio puede servir chunks antiguos por un momento. Si se necesita cero downtime, el siguiente paso es un despliegue por releases con symlink.
- El deploy compila en el VPS. Para builds más rápidos se puede migrar a compilar en GitHub y subir artefactos por `rsync`.

---

## 7. Problemas comunes

| Síntoma | Causa / solución |
|---------|------------------|
| `Permission denied (publickey)` | La llave privada del secret no coincide con `authorized_keys` del usuario, o `VPS_USER` es incorrecto. Probar el mismo comando SSH a mano. |
| `Host key verification failed` | `VPS_HOST_FINGERPRINT` desactualizado (el VPS se reinstaló). Regenerarlo con `ssh-keyscan`. |
| `pnpm: command not found` por SSH | Instalar pnpm globalmente (`sudo npm install -g pnpm@9`) y verificar `ssh usuario@host 'pnpm -v'`. |
| `Cannot find module '@repo/database'` | Node.js menor a 22.18. Actualizar Node. |
| `next: not found` | `pnpm install` no terminó; revisar el log del job. |
| `prisma db push` pide `--accept-data-loss` | El cambio de esquema borra datos. Resolver la migración manualmente; el deploy no lo fuerza a propósito. |
| Healthcheck en rojo | `pm2 logs umbra-web` / `pm2 logs umbra-api`, y verificar que Nginx y los puertos locales respondan. |
| La web carga pero la API falla | Revisar `apps/web/.env.production` y que `NEXT_PUBLIC_API_URL` apunte a `https://back.umbrachat.org`. |
| El WebSocket no conecta | Verificar `NEXT_PUBLIC_SOCKET_URL`, el bloque `socket.umbrachat.org` de Nginx y que el puerto 3002 esté escuchando. |
