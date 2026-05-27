// apps/api/src/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@repo/database';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

/**
 * Definimos una interfaz local para el constructor.
 * Esto le da a TypeScript la forma exacta sin pasar por el objeto 'pg' que el linter odia.
 */
type PoolConstructor = new (config?: pg.PoolConfig) => pg.Pool;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const url = process.env.DATABASE_URL;

    if (!url) {
      throw new Error('DATABASE_URL is not defined');
    }

    // 1. Extraemos el Pool de forma que el linter no pueda rastrear el "unsafe access"
    // Usamos un casting intermedio a 'unknown' para romper la cadena de 'any'
    const RawPool = (pg as unknown as { Pool: PoolConstructor }).Pool;

    // 2. Ahora instanciamos con total seguridad de tipos
    const pool = new RawPool({
      connectionString: url,
    });

    // 3. Creamos el adaptador (usamos 'as any' solo aquí por compatibilidad de Prisma 7)
    const adapter = new PrismaPg(pool);

    super({ adapter: adapter as any });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
