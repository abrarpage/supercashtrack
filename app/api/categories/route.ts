import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createCategorySchema } from "@/lib/validations/category";
import { CREATE, LIST } from "@/services/server/crud";
import { handleError } from "@/services/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const result = await LIST(request, {
      table: "category",
      where: { userId: session.user.id },
      withoutLimitPagination: true,
      QParams: {
        ...(type === "INCOME" || type === "EXPENSE" ? { type } : {}),
        sort: "type,name",
      },
      returnValue: true,
    });

    return NextResponse.json(result);
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
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data tidak valid",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const category = await CREATE(request, {
      table: "category",
      body: {
        userId: session.user.id,
        name: parsed.data.name,
        type: parsed.data.type,
        isDefault: false,
      },
      returnValue: true,
    });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Kategori dengan nama ini sudah ada" },
        { status: 409 },
      );
    }
    return handleError(err);
  }
}
