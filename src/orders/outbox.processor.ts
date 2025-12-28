/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// outbox.processor.ts
import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class OutboxProcessor {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processOutbox() {
    // 아직 처리되지 않은 메시지 조회
    const messages = await this.prisma.outbox.findMany({
      where: { processedAt: null },
      take: 10,
    });

    for (const message of messages) {
      try {
        // Kafka 전송 (메시지 ID를 헤더나 키로 전달)
        this.kafkaClient.emit('order.created', {
          id: message.id, // 중복 방지를 위한 ID
          ...(message.payload as Record<string, unknown>),
        });

        // 처리 완료 표시
        await this.prisma.outbox.update({
          where: { id: message.id },
          data: { processedAt: new Date() },
        });
      } catch (e) {
        console.error('전송 실패:', e);
      }
    }
  }
}
