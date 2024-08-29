import { PrismaClient } from "@prisma/client";

declare global {
  var db: PrismaClient | undefined;
}

// biome-ignore lint/suspicious/noRedeclare: <explanation>
export const db: PrismaClient = global.db || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.db = db;
}

export * from "@prisma/client";
