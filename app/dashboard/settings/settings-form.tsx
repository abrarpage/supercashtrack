"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSettingsSchema, type UpdateSettingsInput } from "@/lib/validations/settings";
import { useApi } from "@/services/client/crud";
import { useMutation } from "@tanstack/react-query";

interface Initial {
  name: string;
  email: string;
  timezone: string;
  currency: string;
}

const TIMEZONES = [
  { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB)" },
  { value: "Asia/Makassar", label: "Asia/Makassar (WITA)" },
  { value: "Asia/Jayapura", label: "Asia/Jayapura (WIT)" },
];

const CURRENCIES = [
  { value: "IDR", label: "Rupiah (IDR)" },
  { value: "USD", label: "Dolar AS (USD)" },
];

export function SettingsForm({ initial }: { initial: Initial }) {
  const { api } = useApi();
  const updateSettings = useMutation({
    mutationFn: async (values: UpdateSettingsInput) => api.patch("settings", values),
  });
  const form = useForm<UpdateSettingsInput>({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues: {
      name: initial.name,
      timezone: initial.timezone,
      currency: initial.currency,
    },
  });

  async function onSubmit(values: UpdateSettingsInput) {
    try {
      await updateSettings.mutateAsync(values);
      toast.success("Pengaturan tersimpan");
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error ===
          "string"
      ) {
        toast.error((error as { response?: { data?: { error?: string } } }).response!.data!.error!);
        return;
      }
      toast.error("Gagal menyimpan pengaturan");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={initial.email} disabled />
        <p className="text-xs text-muted">
          Email diatur dari akun Google kamu dan tidak bisa diubah di sini.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" placeholder="Nama tampilan" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-xs text-trading-down">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="timezone">Zona waktu</Label>
          <Select
            value={form.watch("timezone")}
            onValueChange={(v) => form.setValue("timezone", v)}
          >
            <SelectTrigger id="timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Mata uang</Label>
          <Select
            value={form.watch("currency")}
            onValueChange={(v) => form.setValue("currency", v)}
          >
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Menyimpan..." : "Simpan perubahan"}
      </Button>
    </form>
  );
}
