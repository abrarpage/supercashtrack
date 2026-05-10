"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TelegramIntegrationCard } from "./telegram-integration-card";
import { useApiAnyGet } from "@/services/client/crud";
import { formatDateID } from "@/lib/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export type TelegramIntegrationRow = {
  id: string;
  linkedAt: string;
};

type IntegrationData = {
  publicId: string | null;
  integrations: TelegramIntegrationRow[];
};

export function IntegrationsPageContent() {
  const { data, isLoading } = useApiAnyGet("integrations/telegram");
  const integrationData = (data?.data ?? null) as IntegrationData | null;

  if (isLoading || !integrationData) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted">
          Memuat integrasi...
        </CardContent>
      </Card>
    );
  }

  const integrations = integrationData.integrations ?? [];
  const formatted = integrations.map((row) => ({
    ...row,
    linkedAt: formatDateID(row.linkedAt),
  }));
  const hasAny = formatted.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-strong">Integrasi</h1>
        <p className="text-sm text-muted">
          Hubungkan SuperCashtrack dengan layanan lain (saat ini tersedia Telegram).
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="https://t.me/supercashtrack_bot">
            <Send className="h-4 w-4" />
            Hubungkan
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">Telegram</CardTitle>
            <CardDescription>
              Catat transaksi langsung lewat chat Telegram. Beberapa akun Telegram bisa terhubung ke
              akun SuperCashtrack yang sama.
            </CardDescription>
          </div>
          {hasAny ? (
            <Badge variant="income">Terhubung</Badge>
          ) : (
            <Badge variant="outline">Belum terhubung</Badge>
          )}
        </CardHeader>
        <CardContent>
          <TelegramIntegrationCard publicId={integrationData.publicId} integrations={formatted} />
        </CardContent>
      </Card>
    </div>
  );
}
