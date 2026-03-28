import { PrismaClient } from "@prisma/client";
import { isFrontendOnly } from "@/lib/server/frontendOnly";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function initPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ["error"]
    });
  }

  return globalForPrisma.prisma;
}

export function getPrisma() {
  if (isFrontendOnly()) {
    throw new Error('Prisma is disabled because "FRONTEND_ONLY" is enabled.');
  }

  return initPrisma();
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance = getPrisma();
    const value = instance[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  }
}) as PrismaClient;
