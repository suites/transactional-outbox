// orders.consumer.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class OrdersConsumer {
  constructor(private prisma: PrismaService) {}

  @MessagePattern('order.created')
  async handleOrderCreated(@Payload() data: any) {
    const messageId = data.id;

    // 1. Inbox 확인 및 저장 (트랜잭션)
    try {
      await this.prisma.inbox.create({
        data: { id: messageId },
      });
    } catch (e) {
      // P2002는 Prisma의 유니크 제약조건 위반 에러 (이미 처리된 메시지)
      console.log('이미 처리된 메시지입니다:', messageId);
      return;
    }

    // 2. 실제 비즈니스 로직 수행 (예: 재고 차감 등)
    console.log('주문 처리 중:', data.orderNo);
  }
}
