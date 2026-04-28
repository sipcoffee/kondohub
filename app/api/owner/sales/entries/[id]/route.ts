import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

// DELETE /api/owner/sales/entries/[id]
export async function DELETE(
  _request: NextRequest,
  props: { params: Params },
) {
  const { id } = await props.params;
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

  const entry = await prisma.salesEntry.findUnique({
    where: { id },
    include: { unit: { select: { ownerId: true } } },
  });
  if (!entry) {
    return NextResponse.json(
      { success: false, error: "Entry not found" },
      { status: 404 },
    );
  }
  if (entry.unit.ownerId !== session.user.id && role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Not your entry" },
      { status: 403 },
    );
  }

  await prisma.salesEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
