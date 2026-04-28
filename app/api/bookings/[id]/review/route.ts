import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type Params = Promise<{ id: string }>;

// POST /api/bookings/[id]/review - Tenant submits a review for a completed booking
export async function POST(request: NextRequest, props: { params: Params }) {
  try {
    const params = await props.params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { review: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.tenantId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Only the guest can leave a review" },
        { status: 403 }
      );
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          error: "You can only review a stay after it has been completed",
        },
        { status: 400 }
      );
    }

    if (booking.review) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this stay" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const rating = Number(body.rating);
    const comment: string | null =
      typeof body.comment === "string" && body.comment.length
        ? body.comment.slice(0, 1000)
        : null;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        unitId: booking.unitId,
        tenantId: session.user.id,
        rating,
        comment,
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
