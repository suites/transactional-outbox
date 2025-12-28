/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 1. pg Pool 생성
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 2. Prisma 7 드라이버 어댑터 설정
    const adapter = new PrismaPg(pool);

    // 3. 어댑터를 주입하여 상위 클래스 호출
    super({ adapter });
  }

  async onModuleInit() {
    // Prisma 7에서는 명시적인 $connect 호출이 드라이버 어댑터에 의해 관리되지만,
    // 초기 지연을 방지하기 위해 관례적으로 유지합니다.
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
