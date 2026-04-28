import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/owner/sales/targets — upsert monthly target for a unit
// body: { unitId, year, month, dailyTargetRate, notes? }
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
  const year = parseInt(body.year);
  const month = parseInt(body.month);
  const dailyTargetRate = Number(body.dailyTargetRate);
  const notes =
    typeof body.notes === "string" && body.notes.trim() ? body.notes : null;

  if (
    !unitId ||
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isFinite(dailyTargetRate) ||
    dailyTargetRate < 0
  ) {
    return NextResponse.json(
      { success: false, error: "Invalid payload" },
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

  const target = await prisma.salesTarget.upsert({
    where: { unitId_year_month: { unitId, year, month } },
    create: { unitId, year, month, dailyTargetRate, notes },
    update: { dailyTargetRate, notes },
  });

  return NextResponse.json({ success: true, data: target });
}
