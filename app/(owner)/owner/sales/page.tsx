import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Target,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  buildDailySeries,
  buildPlatformBreakdown,
  buildTrend12,
  computeMonthSummary,
  monthRange,
} from "@/lib/sales";
import { CumulativeChart } from "@/components/sales/cumulative-chart";
import { PlatformDonut } from "@/components/sales/platform-donut";
import { TrendBars } from "@/components/sales/trend-bars";
import { SalesFilters } from "@/components/sales/sales-filters";
import { TargetEditor } from "@/components/sales/target-editor";
import { DailyEntriesTable } from "@/components/sales/daily-entries-table";

export const metadata = {
  title: "Sales Tracker",
};

const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface PageProps {
  searchParams: Promise<{
    unitId?: string;
    year?: string;
    month?: string;
  }>;
}

export default async function OwnerSalesPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const role = (session.user.role as string) || "TENANT";
  if (role !== "OWNER" && role !== "ADMIN") {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const today = new Date();

  const units = await prisma.unit.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, name: true, dailyRate: true },
    orderBy: { createdAt: "asc" },
  });

  if (units.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Sales Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Set monthly revenue targets, log bookings, and track variance.
          </p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No units yet</h2>
            <p className="text-muted-foreground mb-4">
              Add a condo unit to start tracking sales targets.
            </p>
            <Link
              href="/owner/units/new"
              className="inline-flex items-center gap-2 bg-[#222222] text-white px-5 py-2.5 rounded-full text-sm font-semibold"
            >
              Add your first unit
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resolve filter values with sane defaults
  const unitId =
    sp.unitId && units.some((u) => u.id === sp.unitId)
      ? sp.unitId
      : units[0].id;
  const year = parseInt(sp.year || "") || today.getUTCFullYear();
  const monthParam = parseInt(sp.month || "");
  const month =
    monthParam >= 1 && monthParam <= 12
      ? monthParam
      : today.getUTCMonth() + 1;

  const unit = units.find((u) => u.id === unitId)!;
  const range = monthRange(year, month);
  const trendStart = new Date(Date.UTC(year, month - 12, 1));

  const [target, entries, trendEntries, trendTargets] = await Promise.all([
    prisma.salesTarget.findUnique({
      where: { unitId_year_month: { unitId, year, month } },
    }),
    prisma.salesEntry.findMany({
      where: { unitId, date: { gte: range.start, lt: range.end } },
      orderBy: { date: "asc" },
    }),
    prisma.salesEntry.findMany({
      where: { unitId, date: { gte: trendStart, lt: range.end } },
      select: { date: true, revenue: true },
    }),
    prisma.salesTarget.findMany({
      where: { unitId },
      select: { year: true, month: true, dailyTargetRate: true },
    }),
  ]);

  const summary = computeMonthSummary(target, entries, range, today);
  const daily = buildDailySeries(target, entries, range);
  const platforms = buildPlatformBreakdown(entries);
  const trend = buildTrend12(trendEntries, trendTargets, year, month);

  const todayDay =
    today.getUTCFullYear() === year && today.getUTCMonth() + 1 === month
      ? today.getUTCDate()
      : 0;

  const variancePositive = summary.totalVariance > 0; // shortfall
  const pacingPctDisplay = Math.round(summary.pacingPct * 100);
  const expectedPctDisplay = Math.round(summary.expectedPct * 100);
  const ahead = summary.pacingDelta >= 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sales Tracker</h1>
          <p className="text-muted-foreground mt-1">
            {MONTH_FULL[month - 1]} {year} · {unit.name}
          </p>
        </div>
        <TargetEditor
          unitId={unitId}
          year={year}
          month={month}
          current={
            target
              ? {
                  dailyTargetRate: target.dailyTargetRate,
                  notes: target.notes,
                }
              : null
          }
          suggested={unit.dailyRate ?? null}
        />
      </div>

      {/* Filters */}
      <SalesFilters
        units={units.map((u) => ({ id: u.id, name: u.name }))}
        unitId={unitId}
        year={year}
        month={month}
      />

      {/* Goal Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Target Revenue
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {formatCurrency(summary.totalTargetRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalTargetBookings} target booking-days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actual Revenue
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {formatCurrency(summary.totalActualRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalActualBookings} bookings logged
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Variance
            </CardTitle>
            {variancePositive ? (
              <TrendingDown className="h-4 w-4 text-[#C13947]" />
            ) : (
              <TrendingUp className="h-4 w-4 text-[#1F5E58]" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold tabular-nums ${
                variancePositive ? "text-[#C13947]" : "text-[#1F5E58]"
              }`}
            >
              {formatCurrency(Math.abs(summary.totalVariance))}
            </div>
            <p className="text-xs text-muted-foreground">
              {variancePositive ? "Behind target" : "Above target"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacing</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">
                {pacingPctDisplay}%
              </span>
              <Badge
                className={
                  ahead
                    ? "bg-[#DFF0EE] text-[#1F5E58] border-transparent"
                    : "bg-[#FDE8E4] text-[#C13947] border-transparent"
                }
              >
                {ahead ? (
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                )}
                {Math.round(Math.abs(summary.pacingDelta) * 100)}%{" "}
                {ahead ? "ahead" : "behind"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {expectedPctDisplay}% expected by today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cumulative chart + platform mix */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cumulative target vs actual</CardTitle>
            <CardDescription>
              The dashed line is the linear target. The filled curve is your
              actual revenue, summed day-by-day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CumulativeChart daily={daily} todayDay={todayDay} />
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#717171]">
              <span className="inline-flex items-center gap-2">
                <span className="h-0.5 w-5 bg-[#222222]" />
                Target ({formatCurrency(summary.totalTargetRevenue)})
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-0.5 w-5 bg-[#E0484F]" />
                Actual ({formatCurrency(summary.totalActualRevenue)})
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-[#E0484F]/60" />
                Daily revenue bars
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Where it came from</CardTitle>
            <CardDescription>Revenue by platform, this month</CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformDonut slices={platforms} />
          </CardContent>
        </Card>
      </div>

      {/* 12-month trend */}
      <Card>
        <CardHeader>
          <CardTitle>12-month trend</CardTitle>
          <CardDescription>
            Solid bars are actual revenue; the lighter backdrop is the target
            you set for that month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrendBars
            trend={trend}
            highlightYear={year}
            highlightMonth={month}
          />
        </CardContent>
      </Card>

      {/* Daily entries — the spreadsheet */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daily entries</CardTitle>
            <CardDescription>
              Click any field to edit. Saves on blur.
            </CardDescription>
          </div>
          {!target && (
            <Badge className="bg-[#FFF4F0] text-[#C13947] border border-[#FDD3CB]">
              No target set — variance hidden
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <DailyEntriesTable
            key={`${unitId}-${year}-${month}`}
            unitId={unitId}
            unitName={unit.name}
            year={year}
            month={month}
            daily={daily}
          />
        </CardContent>
      </Card>
    </div>
  );
}
