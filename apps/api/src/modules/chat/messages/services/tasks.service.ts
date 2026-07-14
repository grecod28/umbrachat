import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  // Se ejecuta cada hora
  @Cron(CronExpression.EVERY_HOUR)
  async handleMessageCleanup() {
    this.logger.log('Iniciando limpieza de mensajes antiguos...');

    // Fecha de hace 24 horas
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - 24);

    try {
      const { count } = await this.prisma.message.deleteMany({
        where: {
          createdAt: {
            lt: threshold, // "lt" significa "less than"
          },
        },
      });

      if (count > 0) {
        this.logger.log(
          `✅ Se eliminaron ${count} mensajes antiguos con éxito.`,
        );
      }
    } catch (error: unknown) {
      this.logger.error('❌ Error al limpiar mensajes:', error);
    }
  }
}
