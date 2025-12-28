import { Module } from '@nestjs/common';
import { OutboxProcessor } from './outbox.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersConsumer } from './orders.consumer';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          consumer: {
            groupId: process.env.KAFKA_GROUP_ID || 'order-group',
          },
        },
      },
    ]),
  ],
  controllers: [OrdersController, OrdersConsumer],
  providers: [OrdersService, OutboxProcessor],
})
export class OrdersModule {}
