import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDashboardSummary, parseRangeFromQuery } from "@/lib/summary";
import { handleError } from "@/services/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const range = parseRangeFromQuery(req.nextUrl.searchParams);
    const summary = await getDashboardSummary(session.user.id, range);
    return NextResponse.json({ data: summary });
  } catch (error) {
    return handleError(error);
  }
}
