import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string({ message: "Nama wajib diisi" })
      .trim()
      .min(1, { message: "Nama wajib diisi" })
      .max(80, { message: "Nama maksimal 80 karakter" }),
    email: z
      .string({ message: "Email wajib diisi" })
      .trim()
      .toLowerCase()
      .email({ message: "Format email tidak valid" }),
    password: z
      .string({ message: "Kata sandi wajib diisi" })
      .min(8, { message: "Kata sandi minimal 8 karakter" })
      .max(72, { message: "Kata sandi maksimal 72 karakter" }),
    confirmPassword: z
      .string({ message: "Konfirmasi kata sandi wajib diisi" })
      .min(1, { message: "Konfirmasi kata sandi wajib diisi" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak sama",
  });

export const loginSchema = z.object({
  email: z
    .string({ message: "Email wajib diisi" })
    .trim()
    .toLowerCase()
    .email({ message: "Format email tidak valid" }),
  password: z
    .string({ message: "Kata sandi wajib diisi" })
    .min(1, { message: "Kata sandi wajib diisi" }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
