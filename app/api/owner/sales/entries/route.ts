import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Platform } from "@/lib/generated/prisma";

const PLATFORMS: Platform[] = [
  "KONDOHUB",
  "AIRBNB",
  "FACEBOOK",
  "REFERRED",
  "DIRECT",
  "OTHER",
];

// PUT /api/owner/sales/entries — upsert per-day entry for a unit
// body: { unitId, date (YYYY-MM-DD), platform?, bookings?, revenue?, remarks? }
export async function PUT(request: NextRequest) {
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

  const body = await request.json();
  const unitId = String(body.unitId || "");
  const dateStr = String(body.date || "");
  if (!unitId || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json(
      { success: false, error: "Invalid unitId or date (expect YYYY-MM-DD)" },
      { status: 400 },
    );
  }
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json(
      { success: false, error: "Invalid date" },
      { status: 400 },
    );
  }

  let platform: Platform | null = null;
  if (body.platform != null && body.platform !== "") {
    if (!PLATFORMS.includes(body.platform)) {
      return NextResponse.json(
        { success: false, error: "Invalid platform" },
        { status: 400 },
      );
    }
    platform = body.platform as Platform;
  }
  const bookings = body.bookings == null ? 0 : parseInt(body.bookings);
  const revenue = body.revenue == null ? 0 : Number(body.revenue);
  const remarks =
    typeof body.remarks === "string" && body.remarks.trim()
      ? body.remarks
      : null;
  if (
    !Number.isFinite(bookings) ||
    bookings < 0 ||
    !Number.isFinite(revenue) ||
    revenue < 0
  ) {
    return NextResponse.json(
      { success: false, error: "bookings and revenue must be non-negative" },
      { status: 400 },
    );
  }

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: { ownerId: true },
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

  const entry = await prisma.salesEntry.upsert({
    where: { unitId_date: { unitId, date } },
    create: { unitId, date, platform, bookings, revenue, remarks },
    update: { platform, bookings, revenue, remarks },
  });

  return NextResponse.json({ success: true, data: entry });
}
