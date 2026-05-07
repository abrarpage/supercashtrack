import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateTransactionSchema } from "@/lib/validations/transaction";
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
    const parsed = updateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 },
      );
    }

    if (parsed.data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parsed.data.categoryId },
      });
      if (
        !category ||
        category.userId !== session.user.id ||
        category.type !== (parsed.data.type ?? existing.type)
      ) {
        return NextResponse.json(
          { error: "Kategori tidak valid" },
          { status: 400 },
        );
      }
    }

    const updated = await UPDATE(request, {
      table: "transaction",
      params: ctx.params,
      where: { userId: session.user.id },
      include: { category: true },
      body: {
        ...(parsed.data.type ? { type: parsed.data.type } : {}),
        ...(typeof parsed.data.amount === "number"
          ? { amount: parsed.data.amount }
          : {}),
        ...(parsed.data.categoryId
          ? { categoryId: parsed.data.categoryId }
          : {}),
        ...("note" in parsed.data
          ? { note: parsed.data.note?.trim() || null }
          : {}),
        ...(parsed.data.occurredAt
          ? { occurredAt: new Date(parsed.data.occurredAt) }
          : {}),
      },
      returnValue: true,
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        type: updated.type,
        amount: updated.amount.toString(),
        note: updated.note,
        source: updated.source,
        occurredAt: updated.occurredAt.toISOString(),
        category: {
          id: updated.category.id,
          name: updated.category.name,
          type: updated.category.type,
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 },
      );
    }

    await REMOVE(request, { table: "transaction", params: ctx.params, returnValue: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
