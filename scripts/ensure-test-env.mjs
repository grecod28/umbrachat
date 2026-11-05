import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, ".env.test");
const example = resolve(root, ".env.test.example");

if (existsSync(target)) {
  console.log(".env.test already exists");
} else {
  copyFileSync(example, target);
  console.log("Created .env.test from .env.test.example");
}
