import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { OrderCreatedEvent } from './events/order-created.event';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processOutbox() {
    const messages = await this.prisma.outbox.findMany({
      where: { processedAt: null },
      take: 10,
    });

    // 메시지가 있을 때만 로그 출력
    if (messages.length > 0) {
      this.logger.log(
        `Found ${messages.length} unprocessed messages. Publishing...`,
      );

      for (const message of messages) {
        try {
          const payload = message.payload as unknown as Omit<
            OrderCreatedEvent,
            'id'
          >;
          const event: OrderCreatedEvent = {
            id: message.id,
            orderNo: payload.orderNo,
            productId: payload.productId,
          };
          // Kafka 발행
          this.kafkaClient.emit('order.created', event);

          // DB 업데이트
          await this.prisma.outbox.update({
            where: { id: message.id },
            data: { processedAt: new Date() },
          });

          this.logger.log(`Message (ID: ${message.id}) published to Kafka.`);
        } catch (e) {
          this.logger.error(`Failed to publish message: ${e.message}`);
        }
      }
    }
  }
}
