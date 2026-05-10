"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListOrdered, Tags, Plug, KeyRound, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transaksi", icon: ListOrdered },
  { href: "/dashboard/categories", label: "Kategori", icon: Tags },
  { href: "/dashboard/integrations", label: "Integrasi", icon: Plug },
  { href: "/dashboard/account-id", label: "Account ID", icon: KeyRound },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-hairline bg-surface-card md:flex md:flex-col">
      <Link href="/" className="flex h-16 items-center gap-2 border-b border-hairline px-6">
        <img src="/favicon.png" className="h-8 w-8 object-cover" />
        <span className="text-sm font-bold tracking-tight text-primary">CASH TRACKER</span>
      </Link>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-primary/15 text-primary" : "text-ink hover:bg-surface-elevated",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
