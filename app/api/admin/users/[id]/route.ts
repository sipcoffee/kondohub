import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type Params = Promise<{ id: string }>;

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 as const };
  const userRole = (session.user as { role?: string }).role || "TENANT";
  if (userRole !== "ADMIN") {
    return { error: "Forbidden", status: 403 as const };
  }
  return { ok: true as const, adminId: session.user.id };
}

const VALID_ROLES = ["ADMIN", "OWNER", "TENANT"] as const;

// PATCH /api/admin/users/[id] - update role
export async function PATCH(request: NextRequest, props: { params: Params }) {
  try {
    const guard = await requireAdmin();
    if ("error" in guard) {
      return NextResponse.json(
        { success: false, error: guard.error },
        { status: guard.status }
      );
    }
    const { id } = await props.params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (
      typeof body.role === "string" &&
      VALID_ROLES.includes(body.role as (typeof VALID_ROLES)[number])
    ) {
      data.role = body.role;
    }
    if (typeof body.name === "string") data.name = body.name.slice(0, 200);
    if (typeof body.phone === "string") data.phone = body.phone.slice(0, 50);

    if (!Object.keys(data).length) {
      return NextResponse.json(
        { success: false, error: "Nothing to update" },
        { status: 400 }
      );
    }

    if (id === guard.adminId && data.role && data.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "You cannot demote your own admin account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}
