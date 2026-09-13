import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.POSTGRES_PRISMA_URL;
if (!connectionString) {
  throw new Error('POSTGRES_PRISMA_URL is not set');
}

const adapter = new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
