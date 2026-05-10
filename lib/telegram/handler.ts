// Logika utama bot: identifikasi user, parse pesan, simpan, balas.
import { prisma } from "@/lib/prisma";
import { FALLBACK_CATEGORY_NAME } from "@/lib/constants";
import { sendTelegramMessage } from "./api";
import { parseTelegramMessage, splitLeadingPublicId } from "./parse";
import {
  REPLY_DISCONNECTED,
  REPLY_HELP,
  REPLY_LINK_INVALID,
  REPLY_LINK_SUCCESS,
  REPLY_NEED_ACCOUNT_ID,
  REPLY_SEND_ACCOUNT_ID_FIRST,
  REPLY_UNKNOWN_FORMAT,
  REPLY_WELCOME,
  REPLY_WELCOME_BACK,
  formatFilteredChatAppendix,
  replyBalance,
  replyTransactionRecorded,
  type TelegramChatSummary,
} from "./replies";
import type { TelegramMessage } from "./types";

export async function handleTelegramUpdate(message: TelegramMessage) {
  const text = (message.text ?? "").trim();
  const chatId = message.chat.id;
  const tgUserId = message.from?.id;
  if (!tgUserId) return;
console.log("handleTelegramUpdate");

  const split = splitLeadingPublicId(text);
console.log("split:", split);

  let linkedUserId: string | null = null;
  let chatRowId: string | null = null;

  // Jika ada Account ID di pesan, anggap sebagai (re)pairing.
  // - Jika payload kosong: hanya pairing.
  // - Jika ada payload: pairing + eksekusi payload (transaksi/perintah) tanpa perlu kirim lagi.
  if (split.publicId) {
    console.log("split.publicId:", split.publicId);
    
    const linked = await linkChatToPublicId(chatId, split.publicId);
    if (!linked) {
      await sendTelegramMessage(chatId, REPLY_LINK_INVALID);
      return;
    }
    linkedUserId = linked.userId;
    chatRowId = linked.chatRowId;

    if (split.rest.trim() === "") {
      await sendTelegramMessageAndStore(
        linked.chatRowId,
        chatId,
        REPLY_LINK_SUCCESS(linked.publicId),
      );
      await storeIncomingIfPossible(linked.chatRowId, text);
      return;
    }
  } else {
    const ctx = await getLinkedChatContext(chatId);
    linkedUserId = ctx?.userId ?? null;
    chatRowId = ctx?.chatRowId ?? null;
  }

  const innerText = split.publicId ? split.rest.trim() : text.trim();
  const parsedInner = parseTelegramMessage(innerText);

  // /start, /help, /bantuan — tidak wajib Account ID di baris pertama
  if (parsedInner.kind === "command") {
    const cmd = parsedInner.command;
    if (cmd === "start" || cmd === "help" || cmd === "bantuan") {
      const paired = Boolean(await getLinkedChatContext(chatId));
      await storeIncomingIfPossible(chatRowId, text);
      return handlePublicCommand(cmd, message, paired, chatRowId);
    }
  }

  // Transaksi, /saldo, /putuskan, dll. — wajib sudah pernah pairing
  if (!linkedUserId) {
    // Jika user belum pernah pairing, minta Account ID sekali.
    await sendTelegramMessage(chatId, REPLY_NEED_ACCOUNT_ID);
    return;
  }

  await storeIncomingIfPossible(chatRowId, text);
  const chats = await loadChatsForUser(linkedUserId);

  if (parsedInner.kind === "command") {
    return handlePrivilegedCommand(parsedInner.command, message, linkedUserId, chats, chatRowId);
  }

  if (parsedInner.kind === "transaction") {
    return handleTransaction(
      parsedInner,
      linkedUserId,
      chatId,
      message.message_id,
      chats,
      chatRowId,
    );
  }
  console.log("chatRowId:", chatRowId);
  

  if (chatRowId) {
    await sendTelegramMessageAndStore(chatRowId, chatId, REPLY_UNKNOWN_FORMAT);
  } else {
    console.log("formatTidakdikenali");
    
    await sendTelegramMessage(chatId, REPLY_UNKNOWN_FORMAT);
  }
}

type LinkedChatContext = {
  userId: string;
  chatRowId: string;
};

async function getLinkedChatContext(telegramChatId: number): Promise<LinkedChatContext | null> {
  const chat = await prisma.chat.findUnique({
    where: { telegramChatId: String(telegramChatId) },
    select: {
      id: true,
      userId: true,
      sessions: {
        where: { unlinkedAt: null },
        orderBy: { linkedAt: "desc" },
        take: 1,
        select: { userId: true },
      },
    },
  });
  if (!chat) return null;

  const active = chat.sessions?.[0];
  if (active) return { chatRowId: chat.id, userId: active.userId };

  // Backfill: jika ada Chat lama tanpa ChatSession, buat session aktif dari Chat.userId.
  if (chat.userId) {
    await prisma.chatSession.create({
      data: { chatId: chat.id, userId: chat.userId, linkedAt: new Date() },
    });
    return { chatRowId: chat.id, userId: chat.userId };
  }

  return null;
}

async function linkChatToPublicId(
  telegramChatId: number,
  publicId: string,
): Promise<{ chatRowId: string; userId: string; publicId: string } | null> {
  const user = await prisma.user.findUnique({
    where: { publicId },
    select: { id: true, publicId: true },
  });
  if (!user?.publicId) return null;

  const tgKey = String(telegramChatId);
  const now = new Date();

  const existing = await prisma.chat.findUnique({
    where: { telegramChatId: tgKey },
    select: { id: true, userId: true },
  });

  // Jika sudah ada chat untuk telegramChatId ini:
  // - Jika user sama: gunakan chat lama.
  // - Jika user beda: detach telegramChatId dari chat lama supaya message history tidak tercampur,
  //   lalu buat Chat baru untuk user baru.
  let chatRowId: string;
  if (existing && existing.userId === user.id) {
    chatRowId = existing.id;
  } else if (existing) {
    await prisma.chatSession.updateMany({
      where: { chatId: existing.id, unlinkedAt: null },
      data: { unlinkedAt: now },
    });
    await prisma.chat.update({
      where: { id: existing.id },
      data: { telegramChatId: null },
    });
    const created = await prisma.chat.create({
      data: { telegramChatId: tgKey, userId: user.id },
      select: { id: true },
    });
    chatRowId = created.id;
  } else {
    const created = await prisma.chat.create({
      data: { telegramChatId: tgKey, userId: user.id },
      select: { id: true },
    });
    chatRowId = created.id;
  }

  const active = await prisma.chatSession.findFirst({
    where: { chatId: chatRowId, unlinkedAt: null },
    orderBy: { linkedAt: "desc" },
    select: { userId: true },
  });

  if (active?.userId !== user.id) {
    await prisma.chatSession.updateMany({
      where: { chatId: chatRowId, unlinkedAt: null },
      data: { unlinkedAt: now },
    });
    await prisma.chatSession.create({
      data: { chatId: chatRowId, userId: user.id, linkedAt: now },
    });
  }

  // Pastikan Chat.userId = current linked user (untuk query yang masih pakai ini).
  await prisma.chat.update({ where: { id: chatRowId }, data: { userId: user.id } });

  return { chatRowId, userId: user.id, publicId: user.publicId };
}

async function loadChatsForUser(userId: string): Promise<TelegramChatSummary[]> {
  const rows = await prisma.chat.findMany({
    where: { userId },
    include: {
      messages: {
        orderBy: { timestamp: "desc" },
        take: 20,
      },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    messages: c.messages.map((m) => ({
      content: m.content,
      senderType: m.senderType,
      timestamp: m.timestamp,
    })),
  }));
}

async function handlePublicCommand(
  command: string,
  message: TelegramMessage,
  isTelegramChatPaired: boolean,
  chatRowId: string | null,
) {
  const chatId = message.chat.id;

  switch (command) {
    case "start": {
      if (isTelegramChatPaired) {
        const reply = REPLY_WELCOME_BACK(message.from?.first_name);
        if (chatRowId) {
          await sendTelegramMessageAndStore(chatRowId, chatId, reply);
        } else {
          await sendTelegramMessage(chatId, reply);
        }
      } else {
        await sendTelegramMessage(chatId, REPLY_WELCOME);
      }
      return;
    }
    case "bantuan":
    case "help": {
      if (chatRowId) {
        await sendTelegramMessageAndStore(chatRowId, chatId, REPLY_HELP);
      } else {
        await sendTelegramMessage(chatId, REPLY_HELP);
      }
      return;
    }
    default: {
      if (chatRowId) {
        await sendTelegramMessageAndStore(chatRowId, chatId, REPLY_HELP);
      } else {
        await sendTelegramMessage(chatId, REPLY_HELP);
      }
      return;
    }
  }
}

async function handlePrivilegedCommand(
  command: string,
  message: TelegramMessage,
  userId: string,
  chats: TelegramChatSummary[],
  chatRowId: string | null,
) {
  const chatId = message.chat.id;
  const appendix = formatFilteredChatAppendix(chats);

  switch (command) {
    case "saldo":
    case "balance": {
      const grouped = await prisma.transaction.groupBy({
        by: ["type"],
        where: { userId },
        _sum: { amount: true },
      });
      const income = Number(grouped.find((g) => g.type === "INCOME")?._sum.amount ?? 0);
      const expense = Number(grouped.find((g) => g.type === "EXPENSE")?._sum.amount ?? 0);
      const reply = replyBalance({ balance: income - expense, income, expense }) + appendix;
      if (chatRowId) {
        await sendTelegramMessageAndStore(chatRowId, chatId, reply);
      } else {
        await sendTelegramMessage(chatId, reply);
      }
      return;
    }
    case "putuskan":
    case "disconnect": {
      const chatRow = await prisma.chat.findUnique({
        where: { telegramChatId: String(chatId) },
        select: { id: true },
      });
      if (chatRow) {
        await prisma.chatSession.updateMany({
          where: { chatId: chatRow.id, unlinkedAt: null },
          data: { unlinkedAt: new Date() },
        });
      }
      if (chatRowId) {
        await sendTelegramMessageAndStore(chatRowId, chatId, REPLY_DISCONNECTED);
      } else {
        await sendTelegramMessage(chatId, REPLY_DISCONNECTED);
      }
      return;
    }
    case "start":
    case "help":
    case "bantuan": {
      const reply = REPLY_WELCOME_BACK(message.from?.first_name) + appendix;
      if (chatRowId) {
        await sendTelegramMessageAndStore(chatRowId, chatId, reply);
      } else {
        await sendTelegramMessage(chatId, reply);
      }
      return;
    }
    default: {
      if (chatRowId) {
        await sendTelegramMessageAndStore(chatRowId, chatId, REPLY_HELP);
      } else {
        await sendTelegramMessage(chatId, REPLY_HELP);
      }
      return;
    }
  }
}

function isPrismaUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}

async function handleTransaction(
  parsed: Extract<ReturnType<typeof parseTelegramMessage>, { kind: "transaction" }>,
  userId: string,
  chatId: number,
  telegramMessageId: number,
  chats: TelegramChatSummary[],
  chatRowId: string | null,
) {
  const appendix = formatFilteredChatAppendix(chats);

  const wantedCategory = (parsed.category ?? "").trim().toLowerCase();
  let category = wantedCategory
    ? await prisma.category.findFirst({
        where: {
          userId,
          type: parsed.type,
          name: { equals: wantedCategory, mode: "insensitive" },
        },
      })
    : null;

  if (!category && parsed.categorySource === "hashtag" && wantedCategory) {
    try {
      category = await prisma.category.create({
        data: {
          userId,
          name: titleCase(wantedCategory),
          type: parsed.type,
          isDefault: false,
        },
      });
    } catch (err) {
      if (isPrismaUniqueViolation(err)) {
        category = await prisma.category.findFirst({
          where: {
            userId,
            type: parsed.type,
            name: { equals: wantedCategory, mode: "insensitive" },
          },
        });
      } else {
        throw err;
      }
    }
  }

  category =
    category ??
    (await prisma.category.findFirst({
      where: { userId, type: parsed.type, name: FALLBACK_CATEGORY_NAME },
    }));

  if (!category) {
    category = await prisma.category.create({
      data: {
        userId,
        name: FALLBACK_CATEGORY_NAME,
        type: parsed.type,
        isDefault: wantedCategory ? false : true,
      },
    });
  }

  const telegramUpdateKey = `${chatId}:${telegramMessageId}`;

  try {
    const tx = await prisma.transaction.create({
      data: {
        userId,
        categoryId: category.id,
        type: parsed.type,
        amount: parsed.amount,
        note: parsed.note,
        source: "TELEGRAM",
        telegramUpdateKey,
        occurredAt: new Date(),
      },
    });

    const reply =
      replyTransactionRecorded({
        type: parsed.type,
        amount: Number(tx.amount),
        note: parsed.note,
        categoryName: category.name,
        occurredAt: tx.occurredAt,
      }) + appendix;

    if (chatRowId) {
      await sendTelegramMessageAndStore(chatRowId, chatId, reply);
    } else {
      await sendTelegramMessage(chatId, reply);
    }
  } catch (err) {
    if (isPrismaUniqueViolation(err)) {
      return;
    }
    throw err;
  }
}

async function storeIncomingIfPossible(chatRowId: string | null, rawText: string): Promise<void> {
  if (!chatRowId) return;
  const content = rawText.trim();
  if (!content) return;
  await prisma.message.create({
    data: { chatId: chatRowId, senderType: "USER", content },
  });
}

async function sendTelegramMessageAndStore(
  chatRowId: string,
  telegramChatId: number,
  text: string,
): Promise<void> {
  await sendTelegramMessage(telegramChatId, text);
  await prisma.message.create({
    data: { chatId: chatRowId, senderType: "SYSTEM", content: text },
  });
}

function titleCase(s: string): string {
  return s
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
