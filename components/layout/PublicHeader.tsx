import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { auth } from "@/auth";

export default async function PublicHeader() {
  const session = await auth();

  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex h-16 wrapper items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/favicon.png" className="h-8 w-8 object-cover" />
          <span className="text-lg font-bold tracking-tight text-primary">CASH TRACKER</span>
        </Link>
        <Button asChild size="pill">
          <Link href={session?.user ? "/dashboard" : "/login"}>
            {session?.user ? "Dashboard" : "Masuk"}
          </Link>
        </Button>
      </div>
    </header>
  );
}
