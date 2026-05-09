import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/password";
import { generatePublicId } from "@/lib/public-id";
import { ALL_DEFAULT_CATEGORIES } from "@/lib/constants";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  console.log("parsed:", parsed);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
  }

  const hashed = hashPassword(password);

  // Buat user dengan publicId unik (retry jika collide).
  let userId: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          publicId: generatePublicId(),
        },
        select: { id: true },
      });
      userId = user.id;
      break;
    } catch (err: unknown) {
      const code = (err as { code?: string } | null)?.code;
      if (code === "P2002") continue;
      throw err;
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Gagal membuat akun, coba lagi" }, { status: 500 });
  }

  const newUserId = userId;
  await prisma.category.createMany({
    data: ALL_DEFAULT_CATEGORIES.map((c) => ({
      userId: newUserId,
      name: c.name,
      type: c.type,
      isDefault: true,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ data: { id: newUserId } }, { status: 201 });
}
