import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { generateSlug } from "@/lib/utils";
import { nanoid } from "nanoid";

// GET /api/units - List units (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const bedrooms = searchParams.get("bedrooms");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    // By default, only show active units for public
    if (status) {
      where.status = status;
    } else {
      where.status = "ACTIVE";
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (bedrooms) {
      where.bedrooms = { gte: parseInt(bedrooms) };
    }

    const units = await prisma.unit.findMany({
      where,
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
        owner: {
          select: { id: true, name: true },
        },
        _count: {
          select: { reviews: true, bookings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: units });
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

// POST /api/units - Create a new unit (owner only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user.role as string) || "TENANT";
    if (userRole !== "OWNER" && userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only owners can create units" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "address",
      "city",
      "province",
      "bedrooms",
      "bathrooms",
      "maxGuests",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check at least one rate is set
    if (!body.dailyRate && !body.weeklyRate && !body.monthlyRate) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one rate (daily, weekly, or monthly) is required",
        },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(body.name);
    const existingSlug = await prisma.unit.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${nanoid(6)}`;
    }

    // Create unit
    const unit = await prisma.unit.create({
      data: {
        ownerId: session.user.id,
        name: body.name,
        slug,
        description: body.description,
        address: body.address,
        city: body.city,
        province: body.province,
        zipCode: body.zipCode || null,
        bedrooms: parseInt(body.bedrooms),
        bathrooms: parseInt(body.bathrooms),
        maxGuests: parseInt(body.maxGuests),
        squareMeters: body.squareMeters ? parseFloat(body.squareMeters) : null,
        floor: body.floor ? parseInt(body.floor) : null,
        dailyRate: body.dailyRate ? parseFloat(body.dailyRate) : null,
        weeklyRate: body.weeklyRate ? parseFloat(body.weeklyRate) : null,
        monthlyRate: body.monthlyRate ? parseFloat(body.monthlyRate) : null,
        status: body.status || "DRAFT",
      },
    });

    return NextResponse.json({ success: true, data: unit }, { status: 201 });
  } catch (error) {
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create unit" },
      { status: 500 }
    );
  }
}
