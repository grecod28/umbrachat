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

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'umbra-test-jwt-secret-change-me';
process.env.AWS_S3_BUCKET_NAME ??= 'umbra-test-bucket';
process.env.AWS_REGION ??= 'us-east-1';
process.env.AWS_ACCESS_KEY_ID ??= 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY ??= 'test-secret-key';
process.env.PORT ??= '3001';
process.env.WS_PORT ??= '3102';
process.env.THROTTLE_LIMIT ??= '10000';
