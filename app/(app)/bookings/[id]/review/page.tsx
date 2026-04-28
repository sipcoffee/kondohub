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
        <p className="text-sm text-[#E0484F] font-semibold uppercase tracking-wider">
          Review
        </p>
        <h1
          className="mt-1 text-3xl md:text-4xl font-extrabold text-[#222222] tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Tell us how it went.
        </h1>
      </div>

      <ReviewForm bookingId={id} unitName={booking.unit.name} />
    </div>
  );
}
