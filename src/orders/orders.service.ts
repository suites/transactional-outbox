// orders.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(productId: string) {
    const orderNo = `ORD-${Date.now()}`;

    // 핵심: 원자적 트랜잭션
    return await this.prisma.$transaction(async (tx) => {
      // 1. 주문 저장
      const order = await tx.order.create({
        data: { orderNo, productId },
      });

      // 2. 아웃박스에 이벤트 저장 (메시지 ID를 생성하여 넣음)
      await tx.outbox.create({
        data: {
          eventType: 'ORDER_CREATED',
          payload: { orderNo: order.orderNo, productId: order.productId },
        },
      });

      return order;
    });
  }
}
