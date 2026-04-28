import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { uploadToR2 } from "@/lib/r2";

type Params = Promise<{ id: string }>;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// GET /api/units/[id]/photos - list photos for a unit
export async function GET(_req: NextRequest, props: { params: Params }) {
  const { id } = await props.params;
  const photos = await prisma.unitPhoto.findMany({
    where: { unitId: id },
    orderBy: [{ isPrimary: "desc" }, { order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ success: true, data: photos });
}

// POST /api/units/[id]/photos - upload one or more photos
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
      select: { id: true, ownerId: true, _count: { select: { photos: true } } },
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

    const formData = await request.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);
    if (!files.length) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    const created = [];
    let order = unit._count.photos;
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported file type: ${file.type}. Use JPG, PNG, or WebP.`,
          },
          { status: 400 }
        );
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `File ${file.name} exceeds 10 MB`,
          },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const { url, key } = await uploadToR2(buffer, safeName, file.type);
      const photo = await prisma.unitPhoto.create({
        data: {
          unitId: unit.id,
          url,
          key,
          isPrimary: unit._count.photos === 0 && order === 0,
          order: order++,
        },
      });
      created.push(photo);
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("Error uploading photos:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload photos" },
      { status: 500 }
    );
  }
}

// Disable Next's default body parser limit for FormData uploads
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
