// prisma.config.ts
import { defineConfig, env } from 'prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: 'schema.prisma',
  datasource: {
    url: env('DATABASE_URL'), // 환경 변수에서 URL 로드
  },
  migrations: {
    path: '/migrations',
  },
});
