/**
 * Test resolution bridge, not a mock.
 *
 * @repo/database re-exports the generated @prisma/client. pnpm can resolve a
 * different (un-generated) copy of @prisma/client from apps/api, so pointing
 * Jest at the package's own client keeps the real generated PrismaClient that
 * the application uses at runtime.
 */
module.exports = require('../../../packages/database/node_modules/@prisma/client');
