import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type Params = Promise<{ id: string }>;

// GET /api/units/[id] - Get single unit
export async function GET(
  request: NextRequest,
  props: { params: Params }
) {
  try {
    const params = await props.params;
    const unit = await prisma.unit.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
        photos: {
          orderBy: { order: "asc" },
        },
        amenities: {
          include: { amenity: true },
        },
        reviews: {
          include: {
            tenant: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { reviews: true, bookings: true },
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        { success: false, error: "Unit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: unit });
  } catch (error) {
    console.error("Error fetching unit:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unit" },
      { status: 500 }
    );
  }
}

// PATCH /api/units/[id] - Update unit (owner only)
export async function PATCH(
  request: NextRequest,
  props: { params: Params }
) {
  try {
    const params = await props.params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the unit
    const unit = await prisma.unit.findUnique({
      where: { id: params.id },
    });

    if (!unit) {
      return NextResponse.json(
        { success: false, error: "Unit not found" },
        { status: 404 }
      );
    }

    // Check ownership
    const userRole = (session.user.role as string) || "TENANT";
    if (unit.ownerId !== session.user.id && userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Not authorized to edit this unit" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Update unit
    const updatedUnit = await prisma.unit.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        address: body.address,
        city: body.city,
        province: body.province,
        zipCode: body.zipCode || null,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : undefined,
        bathrooms: body.bathrooms ? parseInt(body.bathrooms) : undefined,
        maxGuests: body.maxGuests ? parseInt(body.maxGuests) : undefined,
        squareMeters: body.squareMeters
          ? parseFloat(body.squareMeters)
          : null,
        floor: body.floor ? parseInt(body.floor) : null,
        dailyRate: body.dailyRate ? parseFloat(body.dailyRate) : null,
        weeklyRate: body.weeklyRate ? parseFloat(body.weeklyRate) : null,
        monthlyRate: body.monthlyRate ? parseFloat(body.monthlyRate) : null,
        status: body.status,
      },
    });

    return NextResponse.json({ success: true, data: updatedUnit });
  } catch (error) {
    console.error("Error updating unit:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update unit" },
      { status: 500 }
    );
  }
}

// DELETE /api/units/[id] - Delete unit (owner only)
export async function DELETE(
  request: NextRequest,
  props: { params: Params }
) {
  try {
    const params = await props.params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the unit
    const unit = await prisma.unit.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { bookings: true } },
      },
    });

    if (!unit) {
      return NextResponse.json(
        { success: false, error: "Unit not found" },
        { status: 404 }
      );
    }

    // Check ownership
    const userRole = (session.user.role as string) || "TENANT";
    if (unit.ownerId !== session.user.id && userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this unit" },
        { status: 403 }
      );
    }

    // Check for active bookings
    if (unit._count.bookings > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete unit with existing bookings. Please cancel all bookings first.",
        },
        { status: 400 }
      );
    }

    // Delete unit (cascade will handle photos, amenities, etc.)
    await prisma.unit.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Unit deleted" });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
