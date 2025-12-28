type OrderCreatedPayload = {
  readonly orderNo: string;
  readonly productId: string;
};

export type OrderCreatedEvent = {
  readonly id: string;
  readonly orderNo: OrderCreatedPayload['orderNo'];
  readonly productId: OrderCreatedPayload['productId'];
};

