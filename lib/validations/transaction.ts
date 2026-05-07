import { z } from "zod";

export const txTypeSchema = z.enum(["INCOME", "EXPENSE"], {
  message: "Tipe transaksi tidak valid",
});

export const createTransactionSchema = z.object({
  type: txTypeSchema,
  amount: z
    .number({ message: "Jumlah harus berupa angka" })
    .positive({ message: "Jumlah harus lebih dari 0" }),
  categoryId: z
    .string({ message: "Kategori wajib dipilih" })
    .min(1, { message: "Kategori wajib dipilih" }),
  note: z
    .string()
    .max(280, { message: "Catatan maksimal 280 karakter" })
    .optional()
    .or(z.literal("")),
  occurredAt: z.string().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
