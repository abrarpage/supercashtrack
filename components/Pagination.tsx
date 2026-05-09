"use client";

import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE_OPTIONS = [5, 10, 12, 20, 30, 40, 50] as const;

export type PaginationProps = {
  totalPages: number;
  totalItems: number;
  currentPage: number;
  take: number;
  onPageChange: (page: number) => void;
  /** Hide per-page selector (fixed page size). */
  hidePageSize?: boolean;
  onTakeChange?: (take: number) => void;
  className?: string;
};

const pageLink =
  "flex min-h-10 min-w-10 items-center justify-center rounded-md border border-hairline bg-surface-card px-3 py-2 text-center text-sm font-semibold text-ink transition-colors duration-150 hover:border-muted hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

export function Pagination({
  totalPages,
  totalItems,
  currentPage,
  take,
  onPageChange,
  hidePageSize = false,
  onTakeChange,
  className,
}: PaginationProps) {
  const safePageCount = Math.max(1, totalPages);
  const clampedPage = Math.min(Math.max(currentPage, 1), safePageCount);
  const showPager = totalItems > take;

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2 sm:gap-3", className)}>
      <ReactPaginate
        className={cn("m-0 flex list-none items-center gap-2 p-0", !showPager && "hidden")}
        forcePage={clampedPage - 1}
        pageCount={safePageCount}
        pageRangeDisplayed={2}
        marginPagesDisplayed={1}
        onPageChange={(selected) => onPageChange(selected.selected + 1)}
        breakLabel="..."
        breakClassName="mx-1 list-none"
        breakLinkClassName="pointer-events-none text-sm font-medium text-muted"
        pageClassName="list-none"
        pageLinkClassName={cn(pageLink, "cursor-pointer")}
        activeLinkClassName="!border-primary !bg-primary !text-on-primary hover:!border-primary-active hover:!bg-primary-active"
        previousLabel={<ChevronLeft className="size-[18px]" strokeWidth={2} aria-hidden />}
        nextLabel={<ChevronRight className="size-[18px]" strokeWidth={2} aria-hidden />}
        previousClassName="list-none"
        nextClassName="list-none"
        previousLinkClassName={cn(
          "inline-flex min-h-10 min-w-10 items-center justify-center rounded-md bg-surface-elevated text-ink transition-colors duration-150 hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          clampedPage <= 1 ? "pointer-events-none text-muted opacity-50" : "cursor-pointer",
        )}
        nextLinkClassName={cn(
          "inline-flex min-h-10 min-w-10 items-center justify-center rounded-md bg-surface-elevated text-ink transition-colors duration-150 hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          clampedPage >= safePageCount
            ? "pointer-events-none text-muted opacity-50"
            : "cursor-pointer",
        )}
        renderOnZeroPageCount={null}
      />

      {!hidePageSize && onTakeChange ? (
        <Select value={String(take)} onValueChange={(v) => onTakeChange(Number.parseInt(v, 10))}>
          <SelectTrigger
            className="h-10 w-18 shrink-0 border-hairline bg-surface-card text-sm font-semibold text-ink"
            aria-label="Jumlah per halaman"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
