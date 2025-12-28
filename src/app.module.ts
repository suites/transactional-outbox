import { Module } from '@nestjs/common';
import { OrdersConsumer } from './orders.consumer';
import { OutboxProcessor } from './outbox.processor';
import { OrdersService } from './orders.service';
import { PrismaService } from './prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9092'],
          },
        },
      },
    ]),
  ],
  controllers: [OrdersConsumer],
  providers: [OrdersService, PrismaService, OrdersConsumer, OutboxProcessor],
})
export class AppModule {}
