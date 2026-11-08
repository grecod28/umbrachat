import * as dotenv from 'dotenv';
import * as path from 'node:path';

dotenv.config({
  path: path.resolve(__dirname, '../../../.env.test'),
  quiet: true,
});

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is required for API e2e tests. Create .env.test (see .env.test.example) or export it in CI.',
  );
}

function assertTestDatabase(url: string): void {
  let databaseName: string;

  try {
    databaseName = new URL(url).pathname.replace(/^\//, '');
  } catch {
    throw new Error('DATABASE_URL is not a valid PostgreSQL URL.');
  }

  if (!databaseName.endsWith('_test')) {
    throw new Error(
      `Refusing to run API tests against database "${databaseName}". The database name must end with "_test".`,
    );
  }
}

assertTestDatabase(process.env.DATABASE_URL);

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'umbra-test-jwt-secret-change-me';
process.env.REDIS_URL ??= 'redis://localhost:6380';
process.env.AWS_S3_BUCKET_NAME ??= 'umbra-test-bucket';
process.env.AWS_REGION ??= 'us-east-1';
process.env.AWS_ACCESS_KEY_ID ??= 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY ??= 'test-secret-key';
process.env.PORT ??= '3001';
process.env.WS_PORT ??= '3102';
process.env.THROTTLE_LIMIT ??= '10000';
process.env.IP_THROTTLE_LIMIT ??= '10000';
process.env.SESSION_THROTTLE_LIMIT ??= '10000';
process.env.THROTTLE_BLOCK_MS ??= '1000';
