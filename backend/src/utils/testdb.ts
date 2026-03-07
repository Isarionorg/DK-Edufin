import { prisma } from "../config/prisma";

async function test() {
  await prisma.$connect();
  console.log("✅ Database connected successfully");
}

test();