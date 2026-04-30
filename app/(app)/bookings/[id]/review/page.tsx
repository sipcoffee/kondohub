import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "@/components/forms/review-form";
import { ArrowLeft } from "lucide-react";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Leave a review" };

export default async function ReviewPage(props: { params: Params }) {
  const { id } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(`/login?callbackUrl=/bookings/${id}/review`);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      unit: { select: { name: true } },
      review: true,
    },
  });

  if (!booking) notFound();
  if (booking.tenantId !== session.user.id) notFound();
  if (booking.status !== "COMPLETED") {
    redirect(`/bookings/${id}`);
  }
  if (booking.review) {
    redirect(`/bookings/${id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/bookings/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-[#717171] hover:text-[#222222] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to booking
      </Link>
      <div className="mt-4 mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-2">
          Review your stay
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#222222] leading-[1.05]">
          Tell us how{" "}
          <span className="relative inline-block">
            <span className="relative z-10">{booking.unit.name}</span>
            <span
              className="absolute left-0 right-0 bottom-1 h-2.5 bg-[#FDD3CB] z-0 rounded-sm"
              aria-hidden
            />
          </span>{" "}
          went.
        </h1>
        <p className="mt-3 text-[#717171]">
          A few honest words from you helps the next guest pick the right
          place.
        </p>
      </div>

      <ReviewForm bookingId={id} unitName={booking.unit.name} />
    </div>
  );
}
