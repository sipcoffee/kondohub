import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AvailabilityEditor } from "@/components/forms/availability-editor";
import { ArrowLeft } from "lucide-react";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Availability" };

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function enumerateDays(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cursor < end) {
    out.push(isoDay(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export default async function AvailabilityPage(props: { params: Params }) {
  const { id } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const unit = await prisma.unit.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, ownerId: true },
  });
  if (!unit) notFound();

  const userRole = (session.user.role as string) || "TENANT";
  if (unit.ownerId !== session.user.id && userRole !== "ADMIN") notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [blockedRecords, activeBookings] = await Promise.all([
    prisma.availability.findMany({
      where: {
        unitId: id,
        available: false,
        date: { gte: today },
      },
      select: { date: true },
    }),
    prisma.booking.findMany({
      where: {
        unitId: id,
        status: { in: ["PENDING", "CONFIRMED"] },
        checkOut: { gte: today },
      },
      select: { checkIn: true, checkOut: true },
    }),
  ]);

  const initiallyBlocked = blockedRecords.map((r) => isoDay(r.date));
  const bookingHolds = activeBookings.flatMap((b) =>
    enumerateDays(b.checkIn, b.checkOut),
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href={`/owner/units/${unit.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#717171] hover:text-[#222222] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to unit
        </Link>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-2">
            Availability
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#222222] leading-[1.05]">
            {unit.name}
          </h1>
          <p className="mt-3 text-[#717171] max-w-xl">
            Block out dates the unit isn&apos;t available. Active booking dates
            are locked automatically.
          </p>
        </div>
      </div>

      <AvailabilityEditor
        unitId={unit.id}
        initiallyBlocked={initiallyBlocked}
        bookingHolds={bookingHolds}
      />
    </div>
  );
}
