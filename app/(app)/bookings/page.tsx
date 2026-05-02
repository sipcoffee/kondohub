import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, MapPin, Building2, Star, ArrowRight, Sparkles } from "lucide-react";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";

export const metadata = {
  title: "My Bookings",
};

export default async function BookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { tenantId: session.user.id },
    include: {
      unit: {
        include: {
          photos: { where: { isPrimary: true }, take: 1 },
          owner: { select: { id: true, name: true, email: true } },
        },
      },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) =>
      ["PENDING", "CONFIRMED"].includes(b.status) && new Date(b.checkIn) >= now,
  );
  const pastBookings = bookings.filter(
    (b) =>
      ["COMPLETED", "CANCELLED", "REJECTED"].includes(b.status) ||
      new Date(b.checkOut) < now,
  );

  type BookingWithRelations = (typeof bookings)[number];

  const BookingCard = ({ booking }: { booking: BookingWithRelations }) => (
    <div className="flex flex-col md:flex-row gap-5 rounded-2xl border border-[#EBEBEB] bg-white p-4 md:p-5 transition-all hover:border-[#222222] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]">
      <Link
        href={`/bookings/${booking.id}`}
        className="relative shrink-0 w-full md:w-44 aspect-[16/10] md:aspect-[4/3] rounded-xl overflow-hidden bg-[#F7F7F7]"
      >
        {booking.unit.photos[0] ? (
          <Image
            src={booking.unit.photos[0].url}
            alt={booking.unit.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 className="h-7 w-7 text-[#9CA3AF]" />
          </div>
        )}
      </Link>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-[#222222] line-clamp-1">
              {booking.unit.name}
            </h3>
            <p className="text-xs text-[#717171] mt-0.5 inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {booking.unit.city}, {booking.unit.province}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="rounded-xl bg-[#FAFAFA] px-3 py-2.5 flex items-center gap-2 text-sm text-[#222222]">
          <CalendarDays className="h-4 w-4 text-[#717171]" />
          <span>
            {formatDateShort(booking.checkIn)} →{" "}
            {formatDateShort(booking.checkOut)}
          </span>
          <span className="ml-auto text-[11px] uppercase tracking-wider text-[#717171] font-semibold capitalize">
            {booking.durationType.toLowerCase()}
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3 pt-1">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#717171] font-semibold">
              Total paid
            </p>
            <p className="font-display text-lg font-extrabold text-[#222222] tabular-nums">
              {formatCurrency(booking.totalPrice)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {booking.status === "COMPLETED" && !booking.review && (
              <Link
                href={`/bookings/${booking.id}/review`}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
              >
                <Star className="h-3.5 w-3.5" />
                Leave a review
              </Link>
            )}
            <Link
              href={`/bookings/${booking.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#222222] hover:text-[#E0484F] transition-colors"
            >
              View details
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = ({
    title,
    body,
    showCta,
  }: {
    title: string;
    body: string;
    showCta?: boolean;
  }) => (
    <div className="rounded-2xl border border-[#EBEBEB] bg-white p-12 text-center">
      <div className="h-12 w-12 mx-auto rounded-xl bg-[#FDE8E4] text-[#C13947] flex items-center justify-center mb-4">
        <CalendarDays className="h-5 w-5" />
      </div>
      <h3 className="font-display text-xl font-bold text-[#222222]">{title}</h3>
      <p className="mt-2 text-sm text-[#717171] max-w-sm mx-auto">{body}</p>
      {showCta && (
        <Link
          href="/units"
          className="inline-flex items-center gap-2 mt-5 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-5 py-3 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          Browse condos
        </Link>
      )}
    </div>
  );

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="tenant"
        eyebrow="Your stays"
        title="My bookings"
        highlight="bookings"
        subtitle="Everything you've booked — what's coming up and what's wrapped."
        cta={
          <Link
            href="/units"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-5 py-3 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            Browse condos
          </Link>
        }
      />

      <Tabs defaultValue="upcoming">
        <TabsList className="bg-[#F7F7F7] rounded-full p-1 h-auto max-w-full overflow-x-auto no-scrollbar">
          <TabsTrigger
            value="upcoming"
            className="rounded-full px-5 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#222222] data-[state=active]:shadow-sm"
          >
            Upcoming
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#FDE8E4] text-[#C13947] text-[11px] font-bold">
              {upcomingBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="rounded-full px-5 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#222222] data-[state=active]:shadow-sm"
          >
            Past
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#EBEBEB] text-[#717171] text-[11px] font-bold">
              {pastBookings.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming stays"
              body="Find your next condo — by the night, week, or month."
              showCta
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastBookings.length > 0 ? (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No past stays yet"
              body="Once you complete a booking it shows up here so you can leave a review."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
