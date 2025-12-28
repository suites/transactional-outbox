import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Global } from '@nestjs/common';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
