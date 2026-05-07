import { z } from "zod";

export const updateSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80, { message: "Nama maksimal 80 karakter" })
    .optional(),
  timezone: z
    .string()
    .trim()
    .max(50, { message: "Timezone tidak valid" })
    .optional(),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, { message: "Kode mata uang harus 3 huruf" })
    .optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
