"use client";
import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
  numberOfMonths?: number;
  clearable?: boolean;
}

function fmt(d: Date) {
  return format(d, "d MMM yyyy", { locale: localeId });
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pilih rentang tanggal",
  className,
  align = "start",
  numberOfMonths = 2,
  clearable = true,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const label = React.useMemo(() => {
    if (!value?.from) return placeholder;
    if (value.to) {
      if (value.from.toDateString() === value.to.toDateString()) return fmt(value.from);
      return `${fmt(value.from)} – ${fmt(value.to)}`;
    }
    return fmt(value.from);
  }, [value, placeholder]);

  const hasValue = !!value?.from;

  function handleQuick(kind: "today" | "thisMonth" | "lastMonth" | "thisYear" | "last7" | "last30") {
    const now = new Date();
    let from: Date;
    let to: Date;
    switch (kind) {
      case "today":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "last7":
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
        break;
      case "last30":
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
        break;
      case "thisMonth":
        from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case "lastMonth":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case "thisYear":
        from = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
    }
    onChange?.({ from, to });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 justify-start gap-2 px-3 text-left font-normal",
            !hasValue && "text-muted",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
          <span className="truncate">{label}</span>
          {clearable && hasValue && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(undefined);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  e.preventDefault();
                  onChange?.(undefined);
                }
              }}
              className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded hover:bg-hairline/60"
              aria-label="Hapus filter tanggal"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="flex w-auto flex-col gap-2 p-3 sm:flex-row">
        <div className="flex flex-row gap-1 sm:flex-col sm:border-r sm:border-hairline sm:pr-3">
          <QuickButton onClick={() => handleQuick("today")}>Hari ini</QuickButton>
          <QuickButton onClick={() => handleQuick("last7")}>7 hari</QuickButton>
          <QuickButton onClick={() => handleQuick("last30")}>30 hari</QuickButton>
          <QuickButton onClick={() => handleQuick("thisMonth")}>Bulan ini</QuickButton>
          <QuickButton onClick={() => handleQuick("lastMonth")}>Bulan lalu</QuickButton>
          <QuickButton onClick={() => handleQuick("thisYear")}>Tahun ini</QuickButton>
        </div>
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={numberOfMonths}
          locale={localeId}
          defaultMonth={value?.from ?? new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}

function QuickButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="whitespace-nowrap rounded-md px-3 py-1.5 text-left text-xs font-medium text-ink hover:bg-primary/10 hover:text-primary transition-colors"
    >
      {children}
    </button>
  );
}
