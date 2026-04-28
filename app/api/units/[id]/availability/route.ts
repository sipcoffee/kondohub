import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type Params = Promise<{ id: string }>;

// GET /api/units/[id]/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(request: NextRequest, props: { params: Params }) {
  const { id } = await props.params;
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { unitId: id };
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const records = await prisma.availability.findMany({
    where,
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ success: true, data: records });
}

// POST /api/units/[id]/availability
// Body: { blocked: string[]; unblocked: string[] }
// Dates are ISO YYYY-MM-DD strings.
export async function POST(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const unit = await prisma.unit.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!unit) {
      return NextResponse.json(
        { success: false, error: "Unit not found" },
        { status: 404 }
      );
    }

    const userRole = (session.user.role as string) || "TENANT";
    if (unit.ownerId !== session.user.id && userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const blocked: string[] = Array.isArray(body.blocked) ? body.blocked : [];
    const unblocked: string[] = Array.isArray(body.unblocked)
      ? body.unblocked
      : [];

    const tx = [];
    for (const dateStr of blocked) {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) continue;
      tx.push(
        prisma.availability.upsert({
          where: { unitId_date: { unitId: id, date } },
          create: { unitId: id, date, available: false },
          update: { available: false },
        })
      );
    }
    for (const dateStr of unblocked) {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) continue;
      tx.push(
        prisma.availability.deleteMany({
          where: { unitId: id, date },
        })
      );
    }
    if (tx.length) await prisma.$transaction(tx);

    return NextResponse.json({
      success: true,
      data: { blocked: blocked.length, unblocked: unblocked.length },
    });
  } catch (error) {
    console.error("Error saving availability:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save availability" },
      { status: 500 }
    );
  }
}
