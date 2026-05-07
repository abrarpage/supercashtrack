
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as qs from "qs";
import { queryParams } from "@/services/apiTypes";
import { toast } from "sonner";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const queryParamsToQs = (
  queryParams: Record<string, any> = {},
  { deleteEmpty = false } = {},
): string => {
  // Filter out empty values
  let filteredParams = { ...queryParams };
  if (deleteEmpty) {
    filteredParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value),
    );
  }

  const withParams = Object.keys(filteredParams)?.length;
  const queryString = withParams
    ? "?" +
      qs.stringify(filteredParams, {
        arrayFormat: "indices",
        encode: false,
        format: "RFC3986",
      })
    : "";
  return queryString;
};

export const qsToQueryParams = (queryString: string): queryParams => {
  const parsedParams = qs.parse(queryString, {
    ignoreQueryPrefix: true,
  }) as queryParams;

  return parsedParams;
};

export const handleError = (error: any) => {
  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    "Something wrong";
  toast.error(message);
  return false;
};

export function formatDuration(seconds: number) {
  const d = dayjs.duration(seconds, "seconds");
  const h = Math.floor(d.asHours());
  const m = d.minutes();
  const s = d.seconds();
  if (h > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
export const callTone: Record<string, "blue" | "green" | "amber" | "gray"> = {
  IN_PROGRESS: "green",
  RINGING: "blue",
  QUEUED: "amber",
  INITIATED: "blue",
  COMPLETED: "gray",
  NO_ANSWER: "amber",
  BUSY: "amber",
  FAILED: "amber",
  CANCELED: "gray",
};

export function formatOffsetInCall(seconds: number) {
  if (Number.isNaN(seconds) || !Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function formatConversationDateLabel(
  startUnixSecs: number | null | undefined,
) {
  if (
    typeof startUnixSecs !== "number" ||
    !Number.isFinite(startUnixSecs) ||
    startUnixSecs <= 0
  ) {
    return null;
  }
  const d = dayjs.unix(Math.floor(startUnixSecs)).startOf("day");
  if (d.isSame(dayjs().startOf("day"))) return "Today";
  return d.locale("id").format("D MMMM YYYY");
}

export function formatMessageTime(
  startUnixSecs: number | null | undefined,
  timeInCallSecs: number,
) {
  if (
    typeof startUnixSecs === "number" &&
    Number.isFinite(startUnixSecs) &&
    startUnixSecs > 0 &&
    Number.isFinite(timeInCallSecs)
  ) {
    return dayjs
      .unix(Math.floor(startUnixSecs + timeInCallSecs))
      .format("HH:mm");
  }
  return formatOffsetInCall(timeInCallSecs);
}

export function formatEpochToHHmm(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const d = value > 1e12 ? dayjs(value) : dayjs.unix(Math.floor(value));
  return d.format("HH:mm");
}
