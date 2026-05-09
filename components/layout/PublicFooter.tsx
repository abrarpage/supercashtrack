import React from "react";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex wrapper flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted md:flex-row">
        <span>© {year} Cash Tracker. Dibuat dengan teliti.</span>
        <span>Catatan keuanganmu, di ujung jari.</span>
      </div>
    </footer>
  );
}
