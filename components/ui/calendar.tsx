"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-3",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-ink-strong",
        nav: "flex items-center justify-between absolute inset-x-0 top-0 px-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-7 w-7 opacity-70 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-7 w-7 opacity-70 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted rounded-md w-9 font-medium text-[0.7rem] uppercase tracking-wider",
        week: "flex w-full mt-1",
        day: "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-normal text-ink hover:bg-primary/10 hover:text-primary aria-selected:opacity-100 transition-colors",
        ),
        range_start:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground rounded-l-md",
        range_end:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground rounded-r-md",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:font-semibold",
        today: "[&>button]:ring-1 [&>button]:ring-primary/40 [&>button]:font-semibold",
        outside: "text-muted opacity-40",
        disabled: "text-muted opacity-40",
        range_middle:
          "bg-primary/15 [&>button]:bg-transparent [&>button]:text-ink [&>button]:hover:bg-primary/20 rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) => {
          if (orientation === "left")
            return <ChevronLeft className="h-4 w-4" {...(rest as object)} />;
          return <ChevronRight className="h-4 w-4" {...(rest as object)} />;
        },
      }}
      {...props}
    />
  );
}
