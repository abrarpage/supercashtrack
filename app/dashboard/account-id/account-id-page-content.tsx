"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccountIdCopy } from "./account-id-copy";
import { CheckCircle2, XCircle } from "lucide-react";
import { useApiAnyGet } from "@/services/client/crud";
import type { TelegramIntegrationRow } from "../integrations/integrations-page-content";

type IntegrationData = {
  publicId: string | null;
  integrations: TelegramIntegrationRow[];
};

export function AccountIdPageContent() {
  const { data, isLoading } = useApiAnyGet("integrations/telegram");
  const integrationData = (data?.data ?? null) as IntegrationData | null;

  if (isLoading || !integrationData) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted">
          Memuat account ID...
        </CardContent>
      </Card>
    );
  }

  const publicId = integrationData.publicId ?? "—";
  const integrations = integrationData.integrations ?? [];
  const isConnected = integrations.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-strong">Account ID</h1>
        <p className="text-sm text-muted">
          ID unik kamu untuk menghubungkan akun ke bot Telegram (beberapa akun Telegram
          boleh pakai ID yang sama).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account ID kamu</CardTitle>
          <CardDescription>
            Bagikan ID ini ke bot Telegram saat menghubungkan sesi. Jangan bagikan ke
            orang lain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AccountIdCopy publicId={publicId} />

          <div className="rounded-lg border border-hairline bg-surface-elevated p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted">Status Telegram</span>
              {isConnected ? (
                <Badge variant="income">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Terhubung
                  {integrations.length > 1 ? (
                    <span className="ml-1 font-normal opacity-90">
                      ({integrations.length} sesi)
                    </span>
                  ) : null}
                </Badge>
              ) : (
                <Badge variant="outline">
                  <XCircle className="mr-1 h-3 w-3" />
                  Belum terhubung
                </Badge>
              )}
            </div>
            {isConnected && integrations.length > 1 ? (
              <p className="mt-3 text-sm text-muted">
                Beberapa chat Telegram terhubung ke akun ini (setiap pairing menghasilkan
                sesi terpisah).
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cara menghubungkan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Buka bot Cash Tracker di Telegram.</li>
            <li>
              Kirim perintah <code className="font-numeric text-ink">/start</code>.
            </li>
            <li>
              Saat diminta, kirim Account ID kamu:{" "}
              <code className="font-numeric text-primary">{publicId}</code>.
            </li>
            <li>
              Untuk Telegram lain (HP kedua, dll.), ulangi langkah yang sama dengan ID
              ini — semua sesi mencatat ke akun Cash Tracker yang sama.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
