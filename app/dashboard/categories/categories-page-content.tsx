"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CategoryFormDialog } from "./category-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useApiDelete, useApiList } from "@/services/client/crud";

type CatType = "INCOME" | "EXPENSE";

interface Category {
  id: string;
  name: string;
  type: CatType;
  isDefault: boolean;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { error?: string } } }).response?.data
      ?.error === "string"
  ) {
    return (error as { response?: { data?: { error?: string } } }).response!.data!
      .error!;
  }
  return fallback;
}

export function CategoriesPageContent() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data, isLoading } = useApiList ("categories", {
    queryParams: { take: 1000, page: 1, sort: "type,name" },
  });
  const categories = (data?.data ?? []) as Category[];
  const deleteCategory = useApiDelete ("categories");

  const expenses = categories.filter((c) => c.type === "EXPENSE");
  const incomes = categories.filter((c) => c.type === "INCOME");

  async function handleDelete() {
    if (!deletingCategory) return;
    try {
      await deleteCategory.mutateAsync(deletingCategory.id);
      toast.success("Kategori dihapus");
      setDeletingCategory(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal menghapus kategori"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-strong">Kategori</h1>
          <p className="text-sm text-muted">
            Atur kategori pemasukan dan pengeluaran kamu.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Kategori baru
        </Button>
      </div>

      <Tabs defaultValue="expense">
        <TabsList>
          <TabsTrigger value="expense">
            Pengeluaran ({expenses.length})
          </TabsTrigger>
          <TabsTrigger value="income">Pemasukan ({incomes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="expense">
          <CategoryGrid
            categories={expenses}
            onEdit={(c) => {
              setEditingCategory(c);
              setIsDialogOpen(true);
            }}
            onDelete={setDeletingCategory}
          />
        </TabsContent>
        <TabsContent value="income">
          <CategoryGrid
            categories={incomes}
            onEdit={(c) => {
              setEditingCategory(c);
              setIsDialogOpen(true);
            }}
            onDelete={setDeletingCategory}
          />
        </TabsContent>
      </Tabs>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            Memuat kategori...
          </CardContent>
        </Card>
      ) : null}

      <CategoryFormDialog
        open={isDialogOpen}
        onOpenChange={(o) => {
          setIsDialogOpen(o);
          if (!o) setEditingCategory(null);
        }}
        category={editingCategory}
        onSaved={() => {
          setIsDialogOpen(false);
          setEditingCategory(null);
        }}
      />

      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(o) => !o && setDeletingCategory(null)}
        title="Hapus kategori?"
        description={
          deletingCategory
            ? `Kategori "${deletingCategory.name}" akan dihapus permanen.`
            : ""
        }
        confirmLabel="Hapus"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        loading={deleteCategory.isPending}
      />
    </div>
  );
}

function CategoryGrid({
  categories,
  onEdit,
  onDelete,
}: {
  categories: Category[];
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted">
          Belum ada kategori. Tambahkan kategori baru di atas.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => (
        <Card key={c.id}>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-ink-strong">{c.name}</span>
                {c.isDefault && <Badge variant="outline">Default</Badge>}
              </div>
              <Badge
                variant={c.type === "INCOME" ? "income" : "expense"}
                className="mt-2"
              >
                {c.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(c)}
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(c)}
                aria-label="Hapus"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
