"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiAnyGet } from "@/services/client/crud";
import { SettingsForm } from "./settings-form";

type SettingsData = {
  name: string;
  email: string;
  timezone: string;
  currency: string;
};

export function SettingsPageContent() {
  const { data, isLoading } = useApiAnyGet("settings");
  const settings = (data?.data ?? null) as SettingsData | null;

  if (isLoading || !settings) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted">
          Memuat pengaturan...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-strong">Pengaturan</h1>
        <p className="text-sm text-muted">
          Atur profil, zona waktu, dan preferensi mata uang kamu.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Informasi akun kamu.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm initial={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
