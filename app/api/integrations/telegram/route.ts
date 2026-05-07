import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/services/server";

/** Satu sesi Telegram = satu `Chat` dengan `telegramChatId` terisi. */
function mapTelegramChatRow(chat: { id: string; updatedAt: Date }) {
  return {
    id: chat.id,
    linkedAt: chat.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        publicId: true,
        chats: {
          where: { telegramChatId: { not: null } },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            updatedAt: true,
          },
        },
      },
    });

    const integrations = (user?.chats ?? []).map(mapTelegramChatRow);

    return NextResponse.json({
      data: {
        publicId: user?.publicId ?? null,
        integrations,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    await prisma.chat.deleteMany({
      where: {
        userId: session.user.id,
        telegramChatId: { not: null },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
