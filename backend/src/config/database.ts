import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Khởi tạo Prisma Client với PgBouncer Connection Pooler cho kiến trúc 10.000 CCU
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export let isDatabaseConnected = false;

export async function connectDatabase() {
  try {
    await prisma.$connect();
    isDatabaseConnected = true;
    console.log('✅ Kết nối PostgreSQL Database (PgBouncer Pool) thành công!');
  } catch (error) {
    isDatabaseConnected = false;
    console.warn('⚠️ Chưa kết nối PostgreSQL trực tiếp (Đang chạy chế độ In-Memory/Redis Cache).');
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
