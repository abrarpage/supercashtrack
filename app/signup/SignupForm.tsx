"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: SignupInput) {
    try {
      const { name, email, password,confirmPassword } = values;
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password,confirmPassword }),
      });
  
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error ?? "Gagal mendaftar, coba lagi");
        return;
      }
  
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
  
      if (result?.error) {
        toast.error("Akun dibuat tapi gagal masuk otomatis. Silakan masuk manual.");
        router.push("/login");
        return;
      }
  
      toast.success("Selamat datang di Cash Tracker!");
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.log("error:", error);
      
      toast.error(error instanceof Error ? error.message : "Gagal mendaftar, coba lagi");
      return;
    }

  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama</Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Nama lengkap"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-xs text-trading-down">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="kamu@email.com"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-xs text-trading-down">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Kata sandi</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-xs text-trading-down">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi kata sandi</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Ulangi kata sandi"
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-xs text-trading-down">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Mendaftar..." : "Daftar"}
      </Button>
    </form>
  );
}
