const path = require("node:path");

const root = __dirname;

/**
 * Procesos de producción administrados por PM2.
 *
 * Importante: cada app corre en una sola instancia (fork). El gateway de
 * Socket.IO guarda el estado de las salas en memoria, por lo que un modo
 * cluster necesitaría el adapter de Redis para funcionar.
 */
module.exports = {
  apps: [
    {
      name: "umbra-web",
      cwd: path.join(root, "apps", "web"),
      script: "node_modules/next/dist/bin/next",
      args: "start --hostname 127.0.0.1 --port 3000",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      kill_timeout: 5000,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "umbra-api",
      cwd: path.join(root, "apps", "api"),
      script: "dist/main.js",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      kill_timeout: 5000,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
