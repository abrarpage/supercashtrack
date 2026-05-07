import { z } from "zod";

export const categoryTypeSchema = z.enum(["INCOME", "EXPENSE"], {
  message: "Tipe kategori tidak valid",
});

export const createCategorySchema = z.object({
  name: z
    .string({ message: "Nama kategori wajib diisi" })
    .trim()
    .min(1, { message: "Nama kategori wajib diisi" })
    .max(40, { message: "Nama kategori maksimal 40 karakter" }),
  type: categoryTypeSchema,
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
