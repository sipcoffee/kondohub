import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 as const };
  const userRole = (session.user as { role?: string }).role || "TENANT";
  if (userRole !== "ADMIN") {
    return { error: "Forbidden", status: 403 as const };
  }
  return { ok: true as const };
}

// GET /api/admin/users?role=&search=
export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return NextResponse.json(
      { success: false, error: guard.error },
      { status: guard.status }
    );
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (role && ["ADMIN", "OWNER", "TENANT"].includes(role)) {
    where.role = role;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      _count: {
        select: { units: true, bookings: true },
      },
    },
  });

  return NextResponse.json({ success: true, data: users });
}
