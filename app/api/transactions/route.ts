import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createTransactionSchema } from "@/lib/validations/transaction";
import type { Prisma } from "@/lib/generated/prisma/client";
import { CREATE, LIST } from "@/services/server/crud";
import { handleError } from "@/services/server";

type TransactionWithCategory = Prisma.TransactionGetPayload<{
  include: { category: true };
}>;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const categoryId = url.searchParams.get("categoryId");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const take = Math.min(Math.max(Number(url.searchParams.get("take") ?? 50), 1), 200);
    const pageParam = url.searchParams.get("page");
    const skip = Math.max(Number(url.searchParams.get("skip") ?? 0), 0);
    const page =
      pageParam != null && pageParam !== ""
        ? Math.max(1, Number.parseInt(pageParam, 10) || 1)
        : Math.floor(skip / take) + 1;

    const where: Prisma.TransactionWhereInput = {
      userId: session.user.id,
      ...(from || to
        ? {
            occurredAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const result = await LIST(request, {
      table: "transaction",
      where,
      include: { category: true },
      QParams: {
        ...(type === "INCOME" || type === "EXPENSE" ? { type } : {}),
        ...(categoryId ? { categoryId } : {}),
        take,
        page,
        sort: "-occurredAt",
      },
      returnValue: true,
    });

    return NextResponse.json({
      data: (result.data as TransactionWithCategory[]).map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount.toString(),
        note: t.note,
        source: t.source,
        occurredAt: t.occurredAt.toISOString(),
        category: { id: t.category.id, name: t.category.name, type: t.category.type },
      })),
      meta: result.meta,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!category || category.userId !== session.user.id || category.type !== parsed.data.type) {
      return NextResponse.json(
        { error: "Kategori tidak valid untuk tipe transaksi ini" },
        { status: 400 },
      );
    }

    const tx = await CREATE(request, {
      table: "transaction",
      include: { category: true },
      body: {
        userId: session.user.id,
        categoryId: parsed.data.categoryId,
        type: parsed.data.type,
        amount: parsed.data.amount,
        note: parsed.data.note?.trim() || null,
        source: "WEB",
        occurredAt: parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date(),
      },
      returnValue: true,
    });

    return NextResponse.json(
      {
        data: {
          id: tx.id,
          type: tx.type,
          amount: tx.amount.toString(),
          note: tx.note,
          source: tx.source,
          occurredAt: tx.occurredAt.toISOString(),
          category: { id: tx.category.id, name: tx.category.name, type: tx.category.type },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}
