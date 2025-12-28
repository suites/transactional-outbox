// orders.consumer.ts
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import type { OrderCreatedEvent } from './events/order-created.event';

@Controller()
export class OrdersConsumer {
  private readonly logger = new Logger(OrdersConsumer.name);

  constructor(private prisma: PrismaService) {}

  @MessagePattern('order.created')
  async handleOrderCreated(@Payload() data: OrderCreatedEvent): Promise<void> {
    const messageId: string = data.id;
    const orderNo: string = data.orderNo;

    this.logger.log(`Received message: ${messageId}`);

    // 1. Inbox 확인 및 저장 (트랜잭션)
    try {
      await this.prisma.inbox.create({
        data: { id: messageId },
      });

      this.logger.log(`Inbox saved. Processing Order: ${orderNo}`);
    } catch (e) {
      this.logger.warn(
        `Duplicate message detected (Idempotency check): ${messageId}`,
      );
      return;
    }

    // 2. 실제 비즈니스 로직 수행 (예: 재고 차감 등)
    this.logger.log(`Processing Order: ${orderNo}`);
  }
}
