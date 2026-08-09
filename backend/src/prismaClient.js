import { PrismaClient } from "./generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

// Configure the PostgreSQL connection used by Prisma.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Export a shared Prisma Client instance for database access across the backend.
const prisma = new PrismaClient({ adapter });

export default prisma;
