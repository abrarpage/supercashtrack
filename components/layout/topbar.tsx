"use client";
import { signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    publicId?: string | null;
  };
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-hairline bg-canvas px-6">
      <div className="text-sm text-muted">
        Halo,{" "}
        <span className="text-ink-strong">
          {user.name?.split(" ")[0] ?? "kawan"}
        </span>
        ! Semoga harimu menyenangkan.
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full border border-hairline bg-surface-card p-1 pr-3 transition-colors hover:bg-surface-elevated">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? "User"}
                className="h-7 w-7 rounded-full"
              />
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-elevated text-xs">
                <UserIcon className="h-4 w-4" />
              </span>
            )}
            <span className="text-sm text-ink">{user.name ?? user.email}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
          {user.publicId && (
            <DropdownMenuLabel className="font-numeric text-primary">
              {user.publicId}
            </DropdownMenuLabel>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
