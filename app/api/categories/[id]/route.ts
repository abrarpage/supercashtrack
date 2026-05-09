import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateCategorySchema } from "@/lib/validations/category";
import { REMOVE, UPDATE } from "@/services/server/crud";
import { handleError } from "@/services/server";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = await request.json().catch(() => null);
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    const updated = await UPDATE(request, {
      table: "category",
      params: ctx.params,
      where: { userId: session.user.id },
      body: parsed.data,
      returnValue: true,
    });
    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "Kategori dengan nama ini sudah ada" }, { status: 409 });
    }
    return handleError(err);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    const txCount = await prisma.transaction.count({
      where: { categoryId: id },
    });
    if (txCount > 0) {
      return NextResponse.json(
        {
          error: `Kategori masih dipakai oleh ${txCount} transaksi. Pindahkan dulu.`,
        },
        { status: 409 },
      );
    }

    await REMOVE(request, { table: "category", params: ctx.params, returnValue: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
