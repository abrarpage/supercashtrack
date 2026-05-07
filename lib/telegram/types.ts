// Subset minimum struktur Update Telegram yang kita pakai.
export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

export interface ParsedTransaction {
  kind: "transaction";
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  note: string | null;
}

export interface ParsedCommand {
  kind: "command";
  command: string;
  args: string;
}

export interface ParsedAccountId {
  kind: "account_id";
  publicId: string;
}

export interface ParsedUnknown {
  kind: "unknown";
}

export type ParsedInput =
  | ParsedTransaction
  | ParsedCommand
  | ParsedAccountId
  | ParsedUnknown;
