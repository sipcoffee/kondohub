import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { deleteFromR2 } from "@/lib/r2";

type Params = Promise<{ id: string; photoId: string }>;

async function authorizeOwner(unitId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 as const };

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: { ownerId: true },
  });
  if (!unit) return { error: "Unit not found", status: 404 as const };

  const userRole = (session.user.role as string) || "TENANT";
  if (unit.ownerId !== session.user.id && userRole !== "ADMIN") {
    return { error: "Not authorized", status: 403 as const };
  }
  return { ok: true as const };
}

// PATCH /api/units/[id]/photos/[photoId] - set primary, reorder
export async function PATCH(request: NextRequest, props: { params: Params }) {
  try {
    const { id, photoId } = await props.params;
    const guard = await authorizeOwner(id);
    if ("error" in guard) {
      return NextResponse.json(
        { success: false, error: guard.error },
        { status: guard.status }
      );
    }

    const photo = await prisma.unitPhoto.findUnique({
      where: { id: photoId },
    });
    if (!photo || photo.unitId !== id) {
      return NextResponse.json(
        { success: false, error: "Photo not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (body.isPrimary === true) {
      await prisma.$transaction([
        prisma.unitPhoto.updateMany({
          where: { unitId: id, isPrimary: true },
          data: { isPrimary: false },
        }),
        prisma.unitPhoto.update({
          where: { id: photoId },
          data: { isPrimary: true },
        }),
      ]);
      return NextResponse.json({ success: true });
    }

    if (typeof body.order === "number") {
      await prisma.unitPhoto.update({
        where: { id: photoId },
        data: { order: body.order },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Nothing to update" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error patching photo:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update photo" },
      { status: 500 }
    );
  }
}

// DELETE /api/units/[id]/photos/[photoId]
export async function DELETE(_req: NextRequest, props: { params: Params }) {
  try {
    const { id, photoId } = await props.params;
    const guard = await authorizeOwner(id);
    if ("error" in guard) {
      return NextResponse.json(
        { success: false, error: guard.error },
        { status: guard.status }
      );
    }

    const photo = await prisma.unitPhoto.findUnique({
      where: { id: photoId },
    });
    if (!photo || photo.unitId !== id) {
      return NextResponse.json(
        { success: false, error: "Photo not found" },
        { status: 404 }
      );
    }

    // Best-effort R2 delete (don't fail the request if R2 throws)
    try {
      await deleteFromR2(photo.key);
    } catch (e) {
      console.warn("R2 delete failed; continuing with DB delete", e);
    }

    await prisma.unitPhoto.delete({ where: { id: photoId } });

    // If this was primary, promote the earliest remaining photo
    if (photo.isPrimary) {
      const next = await prisma.unitPhoto.findFirst({
        where: { unitId: id },
        orderBy: { order: "asc" },
      });
      if (next) {
        await prisma.unitPhoto.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
