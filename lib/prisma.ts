import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // log: ['query'], // Uncomment to see SQL queries in console
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
