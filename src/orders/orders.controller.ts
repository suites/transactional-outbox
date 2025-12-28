// src/orders/orders.controller.ts
import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  private readonly logger = new Logger(OrdersController.name);

  @Post()
  async createOrder(@Body() body: { productId: string }) {
    const result = await this.ordersService.createOrder(body.productId);
    this.logger.log(
      `[Order created] id: ${result.id} orderNo: ${result.orderNo} productId: ${result.productId} orderDate: ${result.orderDate}`,
    );

    return result;
  }
}
