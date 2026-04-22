import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { calculateNights } from "@/lib/utils";

// GET /api/bookings - List bookings for current user
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let where: Record<string, unknown> = {};

    // Filter based on role
    if (userRole === "OWNER") {
      // Owner sees bookings for their units
      where = {
        unit: {
          ownerId: session.user.id,
        },
      };
    } else if (userRole === "ADMIN") {
      // Admin sees all bookings
      where = {};
    } else {
      // Tenant sees their own bookings
      where = {
        tenantId: session.user.id,
      };
    }

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        unit: {
          include: {
            photos: {
              where: { isPrimary: true },
              take: 1,
            },
            owner: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        tenant: {
          select: { id: true, name: true, email: true, phone: true },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking (tenant only)
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

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "unitId",
      "checkIn",
      "checkOut",
      "guests",
      "durationType",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Parse dates
    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);

    // Validate dates
    if (checkIn >= checkOut) {
      return NextResponse.json(
        { success: false, error: "Check-out must be after check-in" },
        { status: 400 }
      );
    }

    if (checkIn < new Date()) {
      return NextResponse.json(
        { success: false, error: "Check-in date cannot be in the past" },
        { status: 400 }
      );
    }

    // Fetch the unit
    const unit = await prisma.unit.findUnique({
      where: { id: body.unitId },
    });

    if (!unit) {
      return NextResponse.json(
        { success: false, error: "Unit not found" },
        { status: 404 }
      );
    }

    if (unit.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Unit is not available for booking" },
        { status: 400 }
      );
    }

    // Validate guests
    if (body.guests > unit.maxGuests) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum ${unit.maxGuests} guests allowed`,
        },
        { status: 400 }
      );
    }

    // Check for conflicting bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        unitId: body.unitId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            AND: [
              { checkIn: { lte: checkIn } },
              { checkOut: { gt: checkIn } },
            ],
          },
          {
            AND: [
              { checkIn: { lt: checkOut } },
              { checkOut: { gte: checkOut } },
            ],
          },
          {
            AND: [
              { checkIn: { gte: checkIn } },
              { checkOut: { lte: checkOut } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: "Unit is not available for the selected dates",
        },
        { status: 400 }
      );
    }

    // Calculate price
    const nights = calculateNights(checkIn, checkOut);
    let basePrice = 0;
    const durationType = body.durationType as "DAILY" | "WEEKLY" | "MONTHLY";

    switch (durationType) {
      case "MONTHLY":
        if (!unit.monthlyRate) {
          return NextResponse.json(
            { success: false, error: "Monthly rate not available" },
            { status: 400 }
          );
        }
        basePrice = unit.monthlyRate * Math.ceil(nights / 30);
        break;
      case "WEEKLY":
        if (!unit.weeklyRate) {
          return NextResponse.json(
            { success: false, error: "Weekly rate not available" },
            { status: 400 }
          );
        }
        basePrice = unit.weeklyRate * Math.ceil(nights / 7);
        break;
      case "DAILY":
      default:
        if (!unit.dailyRate) {
          return NextResponse.json(
            { success: false, error: "Daily rate not available" },
            { status: 400 }
          );
        }
        basePrice = unit.dailyRate * nights;
        break;
    }

    const serviceFee = 0; // Can add service fee logic later
    const totalPrice = basePrice + serviceFee;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        unitId: body.unitId,
        tenantId: session.user.id,
        checkIn,
        checkOut,
        durationType,
        guests: parseInt(body.guests),
        basePrice,
        serviceFee,
        totalPrice,
        status: "PENDING",
        tenantNotes: body.tenantNotes || null,
      },
      include: {
        unit: {
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
