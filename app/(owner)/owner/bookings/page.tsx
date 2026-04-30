import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Building2, ArrowRight, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { OwnerBookingActions } from "./actions";

export const metadata = {
  title: "Manage Bookings",
};

export default async function OwnerBookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { unit: { ownerId: session.user.id } },
    include: {
      unit: {
        include: { photos: { where: { isPrimary: true }, take: 1 } },
      },
      tenant: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const otherBookings = bookings.filter(
    (b) => !["PENDING", "CONFIRMED"].includes(b.status),
  );

  type BookingWithRelations = (typeof bookings)[number];

  const BookingCard = ({
    booking,
    showActions,
  }: {
    booking: BookingWithRelations;
    showActions?: boolean;
  }) => (
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
            <p className="text-xs text-[#717171] mt-0.5 capitalize">
              {booking.durationType.toLowerCase()} stay · {booking.guests}{" "}
              {booking.guests === 1 ? "guest" : "guests"}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-[#FAFAFA] px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#222222] text-white text-[10px] font-semibold">
              {booking.tenant.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#222222] truncate">
              {booking.tenant.name}
            </p>
            <p className="text-[11px] text-[#717171] truncate">
              {booking.tenant.email}
              {booking.tenant.phone ? ` · ${booking.tenant.phone}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3 pt-1">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#717171] font-semibold">
              Stay
            </p>
            <p className="text-sm text-[#222222] mt-0.5">
              {formatDateShort(booking.checkIn)} →{" "}
              {formatDateShort(booking.checkOut)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-[#717171] font-semibold">
              Total
            </p>
            <p className="font-display text-lg font-extrabold text-[#222222] tabular-nums">
              {formatCurrency(booking.totalPrice)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EBEBEB]">
          <Link
            href={`/bookings/${booking.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#222222] hover:text-[#E0484F] transition-colors"
          >
            View details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {showActions && booking.status === "PENDING" && (
            <div className="ml-auto">
              <OwnerBookingActions bookingId={booking.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const EmptyState = ({
    icon: Icon,
    title,
    body,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: string;
  }) => (
    <div className="rounded-2xl border border-[#EBEBEB] bg-white p-12 text-center">
      <div className="h-12 w-12 mx-auto rounded-xl bg-[#DFF0EE] text-[#1F5E58] flex items-center justify-center mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-xl font-bold text-[#222222]">{title}</h3>
      <p className="mt-2 text-sm text-[#717171] max-w-sm mx-auto">{body}</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="owner"
        eyebrow="Bookings inbox"
        title="Manage your bookings"
        highlight="bookings"
        subtitle="Review pending requests, confirm guests, and keep track of past stays — all in one place."
        cta={
          pendingBookings.length > 0 ? (
            <span className="inline-flex items-center gap-2 bg-[#222222] text-white px-5 py-3 rounded-full text-sm font-semibold">
              <Clock className="h-4 w-4" />
              {pendingBookings.length}{" "}
              {pendingBookings.length === 1 ? "request" : "requests"} awaiting
              you
            </span>
          ) : null
        }
      />

      <Tabs defaultValue="pending">
        <TabsList className="bg-[#F7F7F7] rounded-full p-1 h-auto">
          <TabsTrigger
            value="pending"
            className="rounded-full px-5 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#222222] data-[state=active]:shadow-sm"
          >
            Pending
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#FDE8E4] text-[#C13947] text-[11px] font-bold">
              {pendingBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="confirmed"
            className="rounded-full px-5 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#222222] data-[state=active]:shadow-sm"
          >
            Confirmed
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#DFF0EE] text-[#1F5E58] text-[11px] font-bold">
              {confirmedBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-full px-5 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#222222] data-[state=active]:shadow-sm"
          >
            History
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#EBEBEB] text-[#717171] text-[11px] font-bold">
              {otherBookings.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingBookings.length > 0 ? (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No pending requests"
              body="New booking requests will land here. We'll notify you the moment a guest applies."
            />
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          {confirmedBookings.length > 0 ? (
            <div className="space-y-4">
              {confirmedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No confirmed bookings"
              body="Once you accept a request, it shows up here so you can prep for the guest."
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {otherBookings.length > 0 ? (
            <div className="space-y-4">
              {otherBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No booking history"
              body="Completed, cancelled, and rejected bookings will appear here."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
