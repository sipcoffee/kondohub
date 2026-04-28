import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    userGroups,
    unitGroups,
    bookingGroups,
    revenueAgg,
    monthRevenueAgg,
    topCities,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.unit.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.booking.aggregate({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      _sum: { totalPrice: true },
    }),
    prisma.booking.aggregate({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalPrice: true },
    }),
    prisma.unit.groupBy({
      by: ["city"],
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 6,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      users: {
        admins: userGroups.find((u) => u.role === "ADMIN")?._count._all ?? 0,
        owners: userGroups.find((u) => u.role === "OWNER")?._count._all ?? 0,
        tenants: userGroups.find((u) => u.role === "TENANT")?._count._all ?? 0,
      },
      units: {
        active: unitGroups.find((u) => u.status === "ACTIVE")?._count._all ?? 0,
        draft: unitGroups.find((u) => u.status === "DRAFT")?._count._all ?? 0,
        inactive:
          unitGroups.find((u) => u.status === "INACTIVE")?._count._all ?? 0,
      },
      bookings: {
        pending:
          bookingGroups.find((b) => b.status === "PENDING")?._count._all ?? 0,
        confirmed:
          bookingGroups.find((b) => b.status === "CONFIRMED")?._count._all ?? 0,
        completed:
          bookingGroups.find((b) => b.status === "COMPLETED")?._count._all ?? 0,
        rejected:
          bookingGroups.find((b) => b.status === "REJECTED")?._count._all ?? 0,
        cancelled:
          bookingGroups.find((b) => b.status === "CANCELLED")?._count._all ?? 0,
      },
      revenue: {
        total: revenueAgg._sum.totalPrice ?? 0,
        thisMonth: monthRevenueAgg._sum.totalPrice ?? 0,
      },
      topCities: topCities.map((c) => ({
        city: c.city,
        units: c._count._all,
      })),
    },
  });
}
