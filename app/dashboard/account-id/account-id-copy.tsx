"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccountIdCopy({ publicId }: { publicId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (publicId === "—") return;
    try {
      await navigator.clipboard.writeText(publicId);
      setCopied(true);
      toast.success("Account ID disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin");
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-canvas p-4">
      <div className="font-numeric text-2xl font-bold tracking-widest text-primary">{publicId}</div>
      <Button variant="secondary" size="sm" onClick={handleCopy} disabled={publicId === "—"}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Tersalin" : "Salin"}
      </Button>
    </div>
  );
}
