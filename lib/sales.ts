import type { Platform } from "@/lib/generated/prisma";

export interface SalesTargetLike {
  dailyTargetRate: number;
  notes?: string | null;
}

export interface SalesEntryLike {
  date: Date;
  platform: Platform | null;
  bookings: number;
  revenue: number;
  remarks: string | null;
}

export interface MonthRange {
  start: Date;
  end: Date;
  days: number;
}

export function monthRange(year: number, month: number): MonthRange {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const days = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return { start, end, days };
}

export function ymKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function isoDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface MonthSummary {
  daysInMonth: number;
  totalTargetBookings: number;
  totalActualBookings: number;
  totalTargetRevenue: number;
  totalActualRevenue: number;
  totalVariance: number;
  /** actual revenue / target revenue, 0..1 (capped at 2 for display) */
  pacingPct: number;
  /** elapsed-day pacing — how much of target should be in by `today` */
  expectedPct: number;
  /** signed variance vs expected pacing */
  pacingDelta: number;
}

/**
 * Compute month-level KPIs.
 *
 * Target is derived from (dailyTargetRate × days in month). One booking
 * per day is the spreadsheet's implicit assumption; we keep that here.
 *
 * `today` is passed in (rather than read from `Date.now()`) so server
 * components can stay deterministic between render and chart.
 */
export function computeMonthSummary(
  target: SalesTargetLike | null,
  entries: SalesEntryLike[],
  range: MonthRange,
  today: Date,
): MonthSummary {
  const dailyRate = target?.dailyTargetRate ?? 0;
  const totalTargetRevenue = dailyRate * range.days;
  const totalTargetBookings = dailyRate > 0 ? range.days : 0;

  let totalActualRevenue = 0;
  let totalActualBookings = 0;
  for (const e of entries) {
    totalActualRevenue += e.revenue;
    totalActualBookings += e.bookings;
  }

  const totalVariance = totalTargetRevenue - totalActualRevenue;
  const pacingPct =
    totalTargetRevenue > 0 ? totalActualRevenue / totalTargetRevenue : 0;

  let elapsedDays: number;
  if (today < range.start) elapsedDays = 0;
  else if (today >= range.end) elapsedDays = range.days;
  else {
    elapsedDays = Math.min(
      range.days,
      Math.ceil(
        (today.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
  }
  const expectedPct = range.days > 0 ? elapsedDays / range.days : 0;
  const pacingDelta = pacingPct - expectedPct;

  return {
    daysInMonth: range.days,
    totalTargetBookings,
    totalActualBookings,
    totalTargetRevenue,
    totalActualRevenue,
    totalVariance,
    pacingPct,
    expectedPct,
    pacingDelta,
  };
}

export interface DailyPoint {
  day: number;
  date: string; // YYYY-MM-DD
  weekday: string; // Mon, Tue, ...
  target: number;
  actual: number;
  cumulativeTarget: number;
  cumulativeActual: number;
  platform: Platform | null;
  remarks: string | null;
  bookings: number;
}

/**
 * Build per-day points across the month with cumulative running totals.
 * Days with no entry get { actual: 0 } so the chart x-axis is continuous.
 */
export function buildDailySeries(
  target: SalesTargetLike | null,
  entries: SalesEntryLike[],
  range: MonthRange,
): DailyPoint[] {
  const dailyRate = target?.dailyTargetRate ?? 0;
  const byDay = new Map<string, SalesEntryLike>();
  for (const e of entries) byDay.set(isoDayKey(e.date), e);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const points: DailyPoint[] = [];
  let cumT = 0;
  let cumA = 0;
  for (let i = 0; i < range.days; i++) {
    const d = new Date(
      Date.UTC(
        range.start.getUTCFullYear(),
        range.start.getUTCMonth(),
        i + 1,
      ),
    );
    const key = isoDayKey(d);
    const entry = byDay.get(key) ?? null;
    cumT += dailyRate;
    cumA += entry?.revenue ?? 0;
    points.push({
      day: i + 1,
      date: key,
      weekday: weekdays[d.getUTCDay()],
      target: dailyRate,
      actual: entry?.revenue ?? 0,
      cumulativeTarget: cumT,
      cumulativeActual: cumA,
      platform: entry?.platform ?? null,
      remarks: entry?.remarks ?? null,
      bookings: entry?.bookings ?? 0,
    });
  }
  return points;
}

export interface PlatformSlice {
  platform: Platform | "UNSET";
  revenue: number;
  bookings: number;
  share: number; // 0..1 of revenue
}

export function buildPlatformBreakdown(
  entries: SalesEntryLike[],
): PlatformSlice[] {
  const buckets = new Map<string, { revenue: number; bookings: number }>();
  let total = 0;
  for (const e of entries) {
    const k = (e.platform ?? "UNSET") as string;
    const cur = buckets.get(k) ?? { revenue: 0, bookings: 0 };
    cur.revenue += e.revenue;
    cur.bookings += e.bookings;
    buckets.set(k, cur);
    total += e.revenue;
  }
  return Array.from(buckets.entries())
    .map(([platform, v]) => ({
      platform: platform as Platform | "UNSET",
      revenue: v.revenue,
      bookings: v.bookings,
      share: total > 0 ? v.revenue / total : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface TrendBucket {
  year: number;
  month: number;
  label: string;
  target: number;
  actual: number;
}

const SHORT_MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Build a 12-month trend ending at (endYear, endMonth) inclusive.
 * Each bucket aggregates target (= dailyTargetRate × days for that month
 * if a target exists) and actual revenue from entries.
 */
export function buildTrend12(
  entries: { date: Date; revenue: number }[],
  targets: { year: number; month: number; dailyTargetRate: number }[],
  endYear: number,
  endMonth: number,
): TrendBucket[] {
  const targetByKey = new Map<string, number>();
  for (const t of targets) {
    targetByKey.set(ymKey(t.year, t.month), t.dailyTargetRate);
  }
  const actualByKey = new Map<string, number>();
  for (const e of entries) {
    const y = e.date.getUTCFullYear();
    const m = e.date.getUTCMonth() + 1;
    const k = ymKey(y, m);
    actualByKey.set(k, (actualByKey.get(k) ?? 0) + e.revenue);
  }

  const out: TrendBucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(endYear, endMonth - 1 - i, 1));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const r = monthRange(y, m);
    const dailyRate = targetByKey.get(ymKey(y, m)) ?? 0;
    out.push({
      year: y,
      month: m,
      label: `${SHORT_MONTH[m - 1]} ${String(y).slice(-2)}`,
      target: dailyRate * r.days,
      actual: actualByKey.get(ymKey(y, m)) ?? 0,
    });
  }
  return out;
}

export const PLATFORM_META: Record<
  Platform | "UNSET",
  { label: string; color: string; bg: string; fg: string }
> = {
  KONDOHUB: {
    label: "KondoHub",
    color: "#E0484F",
    bg: "bg-[#FDE8E4]",
    fg: "text-[#C13947]",
  },
  AIRBNB: {
    label: "Airbnb",
    color: "#FF5A5F",
    bg: "bg-[#FFE5E6]",
    fg: "text-[#B8313A]",
  },
  FACEBOOK: {
    label: "Facebook",
    color: "#1877F2",
    bg: "bg-[#E4EEF5]",
    fg: "text-[#2C4A6B]",
  },
  REFERRED: {
    label: "Referred",
    color: "#7A2E52",
    bg: "bg-[#F7E9F1]",
    fg: "text-[#7A2E52]",
  },
  DIRECT: {
    label: "Direct",
    color: "#1F5E58",
    bg: "bg-[#DFF0EE]",
    fg: "text-[#1F5E58]",
  },
  OTHER: {
    label: "Other",
    color: "#4B5040",
    bg: "bg-[#EAEAE2]",
    fg: "text-[#4B5040]",
  },
  UNSET: {
    label: "Unassigned",
    color: "#9CA3AF",
    bg: "bg-[#F3F4F6]",
    fg: "text-[#6B7280]",
  },
};
