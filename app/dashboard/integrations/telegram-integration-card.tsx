"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useApiDelete } from "@/services/client/crud";
import type { TelegramIntegrationRow } from "./integrations-page-content";
import Link from "next/link";

interface Props {
  publicId: string | null;
  integrations: TelegramIntegrationRow[];
}

export function TelegramIntegrationCard({ publicId, integrations }: Props) {
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const disconnect = useApiDelete("integrations/telegram");

  const hasAny = integrations.length > 0;

  async function handleDisconnect() {
    try {
      await disconnect.mutateAsync(undefined);
      toast.success("Semua koneksi Telegram berhasil diputuskan");
      setConfirmDisconnect(false);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response
          ?.data?.error === "string"
      ) {
        toast.error(
          (error as { response?: { data?: { error?: string } } }).response!.data!
            .error!,
        );
        return;
      }
      toast.error("Gagal memutuskan koneksi");
    }
  }

  if (hasAny) {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {integrations.map((integration, idx) => (
            <div
              key={integration.id}
              className="rounded-lg border border-hairline bg-surface-elevated p-4"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-ink-strong">
                  {integrations.length > 1
                    ? `Sesi Telegram #${idx + 1}`
                    : "Telegram terhubung"}
                </span>
              </div>
              <p className="mb-3 text-xs text-muted">
                Satu sesi = satu chat Telegram yang sudah dikaitkan lewat Account ID. Nama
                pengguna Telegram tidak disimpan di Cash Tracker.
              </p>
              <InfoRow label="Terhubung sejak" value={integration.linkedAt} />
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-hairline bg-surface-elevated p-4 text-sm text-muted">
          <p className="font-medium text-ink">Cara mencatat transaksi:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Tulis Account ID di baris pertama (atau satu baris dengan transaksi), contoh:{" "}
              <code className="font-numeric text-ink">CT-XXXXXX</code> lalu{" "}
              <code className="font-numeric text-ink">15000 beli es krim</code>
            </li>
            <li>
              Pemasukan:{" "}
              <code className="font-numeric text-ink">+500000 gaji freelance</code>
            </li>
            <li>
              Dengan kategori:{" "}
              <code className="font-numeric text-ink">15000 beli es krim #makan</code>
            </li>
          </ul>
        </div>

        <Button variant="destructive" onClick={() => setConfirmDisconnect(true)}>
          Putuskan semua koneksi Telegram
        </Button>

        <ConfirmDialog
          open={confirmDisconnect}
          onOpenChange={setConfirmDisconnect}
          title="Putuskan Telegram?"
          description="Semua sesi Telegram akan dilepas dari Cash Tracker. Kamu bisa hubungkan lagi kapan saja dengan Account ID."
          confirmLabel="Ya, putuskan semua"
          confirmVariant="destructive"
          onConfirm={handleDisconnect}
          loading={disconnect.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-hairline bg-surface-elevated p-4 text-sm">
        <p className="font-medium text-ink-strong">Cara menghubungkan:</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
          <li>Buka bot SuperCashTrack di Telegram. <a href="https://t.me/supercashtrack_bot" target="_blank" className="text-blue-500 hover:text-blue-400 hover:underline">
          https://t.me/supercashtrack_bot
          </a> </li>
          <li>
            Kirim <code className="font-numeric text-ink">/start</code>.
          </li>
          <li>
            Saat diminta, kirim Account ID kamu:{" "}
            <code className="font-numeric text-primary">
              {publicId ?? "(belum tersedia)"}
            </code>
          </li>
          <li>
            Untuk akun Telegram lain, ulangi dengan Account ID yang sama — transaksi tetap
            masuk ke akun Cash Tracker kamu.
          </li>
        </ol>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-sm text-ink-strong">{value}</div>
    </div>
  );
}
