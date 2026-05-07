"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListOrdered,
  Tags,
  Plug,
  KeyRound,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transaksi", icon: ListOrdered },
  { href: "/dashboard/categories", label: "Kategori", icon: Tags },
  { href: "/dashboard/integrations", label: "Integrasi", icon: Plug },
  { href: "/dashboard/account-id", label: "Akun", icon: KeyRound },
  { href: "/dashboard/settings", label: "Setelan", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-6 border-t border-hairline bg-surface-card md:hidden">
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
              "flex flex-col items-center gap-1 py-2 text-[10px]",
              isActive ? "text-primary" : "text-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
