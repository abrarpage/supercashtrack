import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDashboardSummary } from "@/lib/summary";
import { handleError } from "@/services/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const summary = await getDashboardSummary(session.user.id);
    return NextResponse.json({ data: summary });
  } catch (error) {
    return handleError(error);
  }
}
