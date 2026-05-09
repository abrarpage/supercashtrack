"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MessageCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatIDR, formatDateShortID } from "@/lib/format";
import { Pagination } from "@/components/Pagination";
import { useApiDelete, useApiList } from "@/services/client/crud";

const TRANSACTIONS_PAGE_SIZE = 10;

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

export function TransactionsPageContent() {
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | CatType>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(TRANSACTIONS_PAGE_SIZE);
  const transactionsQuery = useApiList("transactions", {
    queryParams: {
      take,
      page,
      ...(filterType !== "ALL" ? { type: filterType } : {}),
      ...(filterCategory !== "ALL" ? { categoryId: filterCategory } : {}),
    },
  });
  const categoriesQuery = useApiList("categories", {
    queryParams: { sort: "type,name" },
  });
  const deleteTransaction = useApiDelete("transactions");
  const transactions = (transactionsQuery.data?.data ?? []) as Transaction[];
  const categories = (categoriesQuery.data?.data ?? []) as Category[];
  const meta = transactionsQuery.data?.meta;

  useEffect(() => {
    setPage(1);
  }, [filterType, filterCategory]);

  useEffect(() => {
    const pageCount = meta?.pageCount ?? 0;
    if (pageCount > 0 && page > pageCount) setPage(pageCount);
  }, [meta?.pageCount, page]);
  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteTransaction.mutateAsync(deleting.id);
      toast.success("Transaksi dihapus");
      setDeleting(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal menghapus transaksi"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-strong">Transaksi</h1>
          <p className="text-sm text-muted">Daftar lengkap pemasukan dan pengeluaran kamu.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Transaksi baru
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-xs text-muted">Filter:</span>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as "ALL" | CatType)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua tipe</SelectItem>
              <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
              <SelectItem value="INCOME">Pemasukan</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua kategori</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {transactionsQuery.isLoading || categoriesQuery.isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            Memuat data transaksi...
          </CardContent>
        </Card>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            Tidak ada transaksi yang cocok dengan filter.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-hairline">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink-strong truncate">
                      {t.note ?? "(tanpa catatan)"}
                    </span>
                    {t.source === "TELEGRAM" ? (
                      <span className="text-muted" title="Dari Telegram">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="text-muted" title="Dari Web">
                        <Globe className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <Badge variant={t.type === "INCOME" ? "income" : "expense"}>
                      {t.category.name}
                    </Badge>
                    <span>{formatDateShortID(t.occurredAt)}</span>
                  </div>
                </div>
                <div
                  className={
                    "font-numeric whitespace-nowrap text-right font-semibold " +
                    (t.type === "INCOME" ? "text-trading-up" : "text-trading-down")
                  }
                >
                  {t.type === "INCOME" ? "+" : "−"}
                  {formatIDR(t.amount)}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditing(t);
                      setIsDialogOpen(true);
                    }}
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleting(t)}
                    aria-label="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!transactionsQuery.isLoading &&
      !categoriesQuery.isLoading &&
      meta &&
      meta.count > TRANSACTIONS_PAGE_SIZE ? (
        <Pagination
          className="pt-2"
          totalPages={meta.pageCount}
          totalItems={meta.count}
          currentPage={page}
          take={take}
          onPageChange={setPage}
          onTakeChange={setTake}
          // hidePageSize
        />
      ) : null}

      <TransactionFormDialog
        open={isDialogOpen}
        onOpenChange={(o) => {
          setIsDialogOpen(o);
          if (!o) setEditing(null);
        }}
        transaction={editing}
        categories={categories}
        onSaved={() => {
          setIsDialogOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Hapus transaksi?"
        description={
          deleting ? `Transaksi ${formatIDR(deleting.amount)} akan dihapus permanen.` : ""
        }
        confirmLabel="Hapus"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        loading={deleteTransaction.isPending}
      />
    </div>
  );
}
