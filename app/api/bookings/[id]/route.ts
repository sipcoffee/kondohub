import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type Params = Promise<{ id: string }>;

// GET /api/bookings/[id] - Get single booking
export async function GET(
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

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        unit: {
          include: {
            photos: true,
            owner: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        tenant: {
          select: { id: true, name: true, email: true, phone: true },
        },
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const userRole = (session.user.role as string) || "TENANT";
    const isOwner = booking.unit.owner.id === session.user.id;
    const isTenant = booking.tenantId === session.user.id;
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isTenant && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Not authorized to view this booking" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id] - Update booking status
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

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        unit: {
          include: {
            owner: { select: { id: true } },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const userRole = (session.user.role as string) || "TENANT";
    const isOwner = booking.unit.owner.id === session.user.id;
    const isTenant = booking.tenantId === session.user.id;
    const isAdmin = userRole === "ADMIN";

    // Validate status transition
    const newStatus = body.status;
    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "REJECTED", "CANCELLED"],
      CONFIRMED: ["CANCELLED", "COMPLETED"],
      REJECTED: [],
      CANCELLED: [],
      COMPLETED: [],
    };

    if (
      newStatus &&
      !validTransitions[booking.status]?.includes(newStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot transition from ${booking.status} to ${newStatus}`,
        },
        { status: 400 }
      );
    }

    // Check authorization for status changes
    if (newStatus === "CONFIRMED" || newStatus === "REJECTED") {
      // Only owner or admin can confirm/reject
      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: "Only the unit owner can confirm or reject bookings",
          },
          { status: 403 }
        );
      }
    }

    if (newStatus === "CANCELLED") {
      // Tenant, owner, or admin can cancel
      if (!isTenant && !isOwner && !isAdmin) {
        return NextResponse.json(
          { success: false, error: "Not authorized to cancel this booking" },
          { status: 403 }
        );
      }
    }

    if (newStatus === "COMPLETED") {
      // Only owner or admin can mark as completed
      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: "Only the unit owner can mark bookings as completed",
          },
          { status: 403 }
        );
      }

      // Check if checkout date has passed
      if (new Date(booking.checkOut) > new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot complete booking before checkout date",
          },
          { status: 400 }
        );
      }
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: newStatus || booking.status,
        ownerNotes: body.ownerNotes ?? booking.ownerNotes,
      },
      include: {
        unit: {
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        tenant: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Cancel booking (alias for PATCH with status=CANCELLED)
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

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        unit: {
          include: {
            owner: { select: { id: true } },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const userRole = (session.user.role as string) || "TENANT";
    const isOwner = booking.unit.owner.id === session.user.id;
    const isTenant = booking.tenantId === session.user.id;
    const isAdmin = userRole === "ADMIN";

    if (!isTenant && !isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Not authorized to cancel this booking" },
        { status: 403 }
      );
    }

    // Only pending or confirmed bookings can be cancelled
    if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
      return NextResponse.json(
        { success: false, error: "This booking cannot be cancelled" },
        { status: 400 }
      );
    }

    // Update to cancelled
    const cancelledBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      success: true,
      message: "Booking cancelled",
      data: cancelledBooking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
