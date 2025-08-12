import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a datetime string for human reading in Asia/Shanghai (UTC+8).
 * Accepts ISO 8601 strings (with or without timezone) and returns a localized string.
 */
export function formatDateTime(v?: string | null, locale: string = "zh") {
  if (!v) return "";
  const raw = v.trim();
  
  // If it's a date-only string, avoid UTC parsing offset; treat as local Shanghai 00:00:00
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (dateOnly) {
    const [, yyyy, mm, dd] = dateOnly;
    if (locale === "zh") return `${yyyy}年${mm}月${dd}日 00:00:00`;
    return `${yyyy}-${mm}-${dd} 00:00:00`;
  }
  
  // If it's a full datetime without timezone, treat as Shanghai local time and format directly
  const fullNoTZ = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(raw);
  if (fullNoTZ) {
    const [, yyyy, mm, dd, HH, MM, SS] = fullNoTZ;
    // 直接格式化，避免时区转换问题
    if (locale === "zh") {
      return `${yyyy}年${mm}月${dd}日 ${HH}:${MM}:${SS}`;
    }
    return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
  }
  
  // For other formats, try to parse as Shanghai local time first
  const isoNoTZ = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/.exec(raw);
  let d: Date;
  if (isoNoTZ) {
    // Parse as Shanghai time by appending +08:00
    d = new Date(`${raw}+08:00`);
  } else {
    d = new Date(raw);
  }
  if (Number.isNaN(d.getTime())) return v; // fallback to raw
  
  const rtf = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = rtf.formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value || "";
  const yyyy = get("year");
  const mm = get("month");
  const dd = get("day");
  const HH = get("hour");
  const MM = get("minute");
  const SS = get("second");
  if (locale === "zh") {
    return `${yyyy}年${mm}月${dd}日 ${HH}:${MM}:${SS}`;
  }
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
}
