"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { createCategorySchema, type CreateCategoryInput } from "@/lib/validations/category";
import { useApiPatch, useApiPost } from "@/services/client/crud";

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error ===
      "string"
  ) {
    return (error as { response?: { data?: { error?: string } } }).response!.data!.error!;
  }
  return fallback;
}

interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  isDefault: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSaved: () => void;
}

export function CategoryFormDialog({ open, onOpenChange, category, onSaved }: Props) {
  const isEdit = !!category;
  const createCategory = useApiPost("categories");
  const updateCategory = useApiPatch("categories");

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name ?? "",
        type: category?.type ?? "EXPENSE",
      });
    }
  }, [open, category, form]);

  async function onSubmit(values: CreateCategoryInput) {
    try {
      if (isEdit) {
        await updateCategory.mutateAsync({ id: category!.id, payload: values });
      } else {
        await createCategory.mutateAsync(values);
      }
      toast.success(isEdit ? "Kategori diperbarui" : "Kategori ditambahkan");
      onSaved();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal menyimpan kategori"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Kategori" : "Kategori Baru"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Ubah nama atau tipe kategori."
              : "Tambah kategori baru untuk transaksi kamu."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama kategori</Label>
            <Input id="name" placeholder="Contoh: Makan" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-trading-down">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipe</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(v) => form.setValue("type", v as "INCOME" | "EXPENSE")}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                <SelectItem value="INCOME">Pemasukan</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-xs text-trading-down">{form.formState.errors.type.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting || createCategory.isPending || updateCategory.isPending
              }
            >
              {form.formState.isSubmitting || createCategory.isPending || updateCategory.isPending
                ? "Menyimpan..."
                : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
