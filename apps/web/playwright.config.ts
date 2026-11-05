import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env.test"),
  quiet: true,
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required for Playwright e2e tests. Create .env.test (see .env.test.example) or export it in CI.",
  );
}

function assertTestDatabase(url: string): void {
  let databaseName: string;

  try {
    databaseName = new URL(url).pathname.replace(/^\//, "");
  } catch {
    throw new Error("DATABASE_URL is not a valid PostgreSQL URL.");
  }

  if (!databaseName.endsWith("_test")) {
    throw new Error(
      `Refusing to run Playwright against database "${databaseName}". The database name must end with "_test".`,
    );
  }
}

assertTestDatabase(databaseUrl);

const apiEnv = {
  DATABASE_URL: databaseUrl,
  JWT_SECRET: process.env.JWT_SECRET ?? "umbra-e2e-jwt-secret-change-me",
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME ?? "umbra-e2e-bucket",
  AWS_REGION: process.env.AWS_REGION ?? "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ?? "test-access-key",
  AWS_SECRET_ACCESS_KEY:
    process.env.AWS_SECRET_ACCESS_KEY ?? "test-secret-key",
  PORT: "3001",
  WS_PORT: "3002",
  NODE_ENV: "test",
  THROTTLE_LIMIT: "1000",
};

export default defineConfig({
  testDir: "./e2e",
  outputDir: "test-results",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command:
        "pnpm --filter @repo/database db:migrate:deploy && pnpm --filter api start:prod",
      url: "http://localhost:3001/api/docs-json",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: apiEnv,
    },
    {
      command: "pnpm --filter web start",
      url: "http://localhost:3000/en",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
});
