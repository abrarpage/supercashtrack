// Jalankan: bun scripts/reset-password.ts <email> <new-password>
// Contoh:   bun scripts/reset-password.ts plainthingdev@gmail.com "rahasia123"

import "dotenv/config";

import { hashPassword } from "../lib/password";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

async function main() {
  const [email, newPassword] = process.argv.slice(2);

  if (!email || !newPassword) {
    console.error("Usage: bun scripts/reset-password.ts <email> <new-password>");
    process.exit(1);
  }



  try {
    const hashed = hashPassword(newPassword);
    console.log("hashed:", hashed);
    
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashed },
      select: { id: true, email: true },
    });

    console.log(`Password updated for ${user.email} (id: ${user.id})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
