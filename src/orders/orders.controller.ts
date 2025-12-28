// src/orders/orders.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() body: { productId: string }) {
    // 테스트를 위해 상품 ID는 하드코딩하거나 Body로 받습니다.
    return await this.ordersService.createOrder(body.productId);
  }
}
