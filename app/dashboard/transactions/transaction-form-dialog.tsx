"use client";
import { useEffect, useState } from "react";
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
import { RSelect, RCreatableSelect, type RSOption } from "@/components/ui/react-select";
import { useApiPatch, useApiPost } from "@/services/client/crud";
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from "@/lib/validations/transaction";

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

type CatType = "INCOME" | "EXPENSE";

interface Category {
  id: string;
  name: string;
  type: CatType;
}

interface Transaction {
  id: string;
  type: CatType;
  amount: string;
  note: string | null;
  source: "WEB" | "TELEGRAM";
  occurredAt: string;
  category: Category;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  categories: Category[];
  onSaved: () => void;
  onCategoryCreated?: (category: Category) => void;
}

const TYPE_OPTIONS: RSOption<CatType>[] = [
  { value: "EXPENSE", label: "Pengeluaran" },
  { value: "INCOME", label: "Pemasukan" },
];

function toDateInputValue(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  categories,
  onSaved,
  onCategoryCreated,
}: Props) {
  const isEdit = !!transaction;
  const [creatingCategory, setCreatingCategory] = useState(false);
  const createCategory = useApiPost("categories");
  const createTransaction = useApiPost("transactions");
  const updateTransaction = useApiPatch("transactions");

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      categoryId: "",
      note: "",
      occurredAt: toDateInputValue(),
    },
  });
  useEffect(() => {
    setTimeout(() => (document.body.style.pointerEvents = ""), 0);
  });
  useEffect(() => {
    if (open) {
      form.reset({
        type: transaction?.type ?? "EXPENSE",
        amount: transaction ? Number(transaction.amount) : 0,
        categoryId: transaction?.category.id ?? "",
        note: transaction?.note ?? "",
        occurredAt: toDateInputValue(transaction?.occurredAt),
      });
    }
  }, [open, transaction, form]);

  const watchedType = form.watch("type");
  const watchedCategoryId = form.watch("categoryId");
  const filteredCategories = categories.filter((c) => c.type === watchedType);

  const categoryOptions: RSOption[] = filteredCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const selectedCategoryOption = categoryOptions.find((o) => o.value === watchedCategoryId) ?? null;

  async function handleCreateCategory(name: string) {
    setCreatingCategory(true);
    try {
      const response = await createCategory.mutateAsync({
        name,
        type: watchedType,
      });
      const created: Category = response.data.data;
      toast.success(`Kategori "${created.name}" ditambahkan`);
      form.setValue("categoryId", created.id);
      onCategoryCreated?.(created);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal membuat kategori"));
    } finally {
      setCreatingCategory(false);
    }
  }

  async function onSubmit(values: CreateTransactionInput) {
    try {
      const payload = {
        ...values,
        amount: Number(values.amount),
        occurredAt: values.occurredAt ? new Date(values.occurredAt).toISOString() : undefined,
      };
      if (isEdit) {
        await updateTransaction.mutateAsync({
          id: transaction!.id,
          payload,
        });
      } else {
        await createTransaction.mutateAsync(payload);
      }
      toast.success(isEdit ? "Transaksi diperbarui" : "Transaksi dicatat");
      onSaved();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal menyimpan transaksi"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Transaksi" : "Transaksi Baru"}</DialogTitle>
          <DialogDescription>Catat pemasukan atau pengeluaran kamu.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="type">Tipe</Label>
              <RSelect<RSOption<CatType>>
                inputId="type"
                options={TYPE_OPTIONS}
                value={TYPE_OPTIONS.find((o) => o.value === watchedType) ?? null}
                onChange={(opt) => {
                  if (!opt) return;
                  form.setValue("type", opt.value);
                  form.setValue("categoryId", "");
                }}
                isSearchable={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occurredAt">Tanggal</Label>
              <Input id="occurredAt" type="date" {...form.register("occurredAt")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              step="1"
              min="0"
              placeholder="15000"
              {...form.register("amount", { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-trading-down">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Kategori</Label>
            <RCreatableSelect<RSOption>
              inputId="categoryId"
              options={categoryOptions}
              value={selectedCategoryOption}
              onChange={(opt) => form.setValue("categoryId", opt?.value ?? "")}
              onCreateOption={handleCreateCategory}
              isLoading={creatingCategory}
              isDisabled={creatingCategory}
              placeholder="Pilih atau buat kategori"
              formatCreateLabel={(input) => `Buat kategori "${input}"`}
              noOptionsMessage={() => "Belum ada kategori untuk tipe ini."}
            />
            {form.formState.errors.categoryId && (
              <p className="text-xs text-trading-down">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Catatan (opsional)</Label>
            <Input id="note" placeholder="Contoh: beli es krim" {...form.register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                createTransaction.isPending ||
                updateTransaction.isPending
              }
            >
              {form.formState.isSubmitting ||
              createTransaction.isPending ||
              updateTransaction.isPending
                ? "Menyimpan..."
                : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
