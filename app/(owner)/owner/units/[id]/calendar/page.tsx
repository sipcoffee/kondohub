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
    enumerateDays(b.checkIn, b.checkOut)
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link
          href={`/owner/units/${unit.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to unit
        </Link>
        <div className="mt-3">
          <h1 className="text-3xl font-bold">{unit.name}</h1>
          <p className="text-muted-foreground mt-1">
            Block out dates when your unit isn&apos;t available.
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
