import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildDailySeries,
  buildPlatformBreakdown,
  buildTrend12,
  computeMonthSummary,
  monthRange,
} from "@/lib/sales";

// GET /api/owner/sales/summary?unitId=&year=&month=
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  const role = (session.user.role as string) || "TENANT";
  if (role !== "OWNER" && role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Owners only" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const unitId = searchParams.get("unitId");
  const year = parseInt(searchParams.get("year") || "");
  const month = parseInt(searchParams.get("month") || "");
  if (!unitId || !year || !month || month < 1 || month > 12) {
    return NextResponse.json(
      { success: false, error: "unitId, year, month are required" },
      { status: 400 },
    );
  }

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: { id: true, name: true, ownerId: true, dailyRate: true },
  });
  if (!unit) {
    return NextResponse.json(
      { success: false, error: "Unit not found" },
      { status: 404 },
    );
  }
  if (unit.ownerId !== session.user.id && role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Not your unit" },
      { status: 403 },
    );
  }

  const range = monthRange(year, month);

  // Trend window: 12 months ending at (year, month)
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
      where: {
        unitId,
        OR: [
          { year, month: { lte: month } },
          { year: { lt: year } },
        ],
      },
      select: { year: true, month: true, dailyTargetRate: true },
    }),
  ]);

  const summary = computeMonthSummary(target, entries, range, new Date());
  const daily = buildDailySeries(target, entries, range);
  const platforms = buildPlatformBreakdown(entries);
  const trend = buildTrend12(trendEntries, trendTargets, year, month);

  return NextResponse.json({
    success: true,
    data: {
      unit,
      year,
      month,
      target,
      entries,
      summary,
      daily,
      platforms,
      trend,
    },
  });
}
