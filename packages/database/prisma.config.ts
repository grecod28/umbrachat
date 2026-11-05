import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

const isTest = process.env.NODE_ENV === "test";

if (isTest) {
  // Never fall back to .env in test mode: it points to the development database.
  dotenv.config({ path: "../../.env.test", quiet: true });
} else {
  dotenv.config({ path: "../../.env", quiet: true });
}

const databaseUrl = process.env["DATABASE_URL"];

if (isTest) {
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required for test migrations. Run `pnpm test:env` or create .env.test.",
    );
  }

  let databaseName: string;

  try {
    databaseName = new URL(databaseUrl).pathname.replace(/^\//, "");
  } catch {
    throw new Error("DATABASE_URL is not a valid PostgreSQL URL.");
  }

  if (!databaseName.endsWith("_test")) {
    throw new Error(
      `Refusing to run test migrations against database "${databaseName}". The database name must end with "_test".`,
    );
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
