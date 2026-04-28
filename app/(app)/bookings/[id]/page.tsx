import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, calculateNights } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { BookingActions } from "./actions";
import {
  Building2,
  CalendarDays,
  MapPin,
  Users,
  Star,
  ArrowLeft,
  Phone,
  Mail,
  StickyNote,
} from "lucide-react";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Booking" };

export default async function BookingDetailPage(props: { params: Params }) {
  const { id } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      unit: {
        include: {
          photos: { orderBy: { order: "asc" }, take: 4 },
          owner: {
            select: { id: true, name: true, email: true, phone: true, image: true },
          },
        },
      },
      tenant: {
        select: { id: true, name: true, email: true, phone: true, image: true },
      },
      review: true,
    },
  });

  if (!booking) notFound();

  const userRole = (session.user.role as string) || "TENANT";
  const isTenant = booking.tenantId === session.user.id;
  const isOwner = booking.unit.owner.id === session.user.id;
  const isAdmin = userRole === "ADMIN";
  if (!isTenant && !isOwner && !isAdmin) notFound();

  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const primaryPhoto = booking.unit.photos[0];

  const isCancellable = ["PENDING", "CONFIRMED"].includes(booking.status);
  const canReview =
    isTenant && booking.status === "COMPLETED" && !booking.review;
  const canCompleteEarly = false; // owner can mark complete only after checkout date — handled API-side

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={isOwner ? "/owner/bookings" : "/bookings"}
          className="inline-flex items-center gap-1.5 text-sm text-[#717171] hover:text-[#222222] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isOwner ? "All bookings" : "My stays"}
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#717171] uppercase tracking-wider">
              Booking ref · {booking.id.slice(0, 8).toUpperCase()}
            </p>
            <h1
              className="mt-1 text-3xl md:text-4xl font-extrabold text-[#222222] tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {booking.unit.name}
            </h1>
            <p className="mt-1 text-sm text-[#717171] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {booking.unit.city}, {booking.unit.province}
            </p>
          </div>
          <StatusBadge status={booking.status} className="text-xs" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stay summary */}
          <div className="rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-5 p-5">
              <div className="relative h-40 sm:h-32 sm:w-40 rounded-xl overflow-hidden bg-[#F7F7F7] shrink-0">
                {primaryPhoto ? (
                  <Image
                    src={primaryPhoto.url}
                    alt={booking.unit.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#9CA3AF]">
                    <Building2 className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-[#222222] truncate">
                  {booking.unit.name}
                </h2>
                <p className="text-sm text-[#717171] mt-0.5">
                  {booking.unit.bedrooms} BR · {booking.unit.bathrooms} BA · up to{" "}
                  {booking.unit.maxGuests} guests
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <DetailItem
                    icon={CalendarDays}
                    label="Check-in"
                    value={formatDate(booking.checkIn)}
                  />
                  <DetailItem
                    icon={CalendarDays}
                    label="Check-out"
                    value={formatDate(booking.checkOut)}
                  />
                  <DetailItem
                    icon={Users}
                    label="Guests"
                    value={`${booking.guests} ${booking.guests === 1 ? "guest" : "guests"}`}
                  />
                  <DetailItem
                    icon={Building2}
                    label="Stay type"
                    value={
                      booking.durationType === "DAILY"
                        ? `${nights} ${nights === 1 ? "night" : "nights"}`
                        : booking.durationType.charAt(0) +
                          booking.durationType.slice(1).toLowerCase()
                    }
                  />
                </div>
                <Link
                  href={`/units/${booking.unit.slug}`}
                  className="inline-block mt-4 text-sm font-semibold text-[#E0484F] hover:underline"
                >
                  View listing →
                </Link>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(booking.tenantNotes || booking.ownerNotes) && (
            <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 space-y-4">
              {booking.tenantNotes && (
                <NoteBlock
                  label={isTenant ? "Your note to the host" : `From ${booking.tenant.name}`}
                  body={booking.tenantNotes}
                />
              )}
              {booking.ownerNotes && (
                <NoteBlock
                  label={isOwner ? "Your reply" : `From ${booking.unit.owner.name}`}
                  body={booking.ownerNotes}
                />
              )}
            </div>
          )}

          {/* Counterparty */}
          <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5">
            <p className="text-[10px] uppercase tracking-wider text-[#717171] font-semibold">
              {isTenant ? "Hosted by" : "Guest"}
            </p>
            {isTenant ? (
              <ContactBlock
                name={booking.unit.owner.name}
                email={booking.unit.owner.email}
                phone={booking.unit.owner.phone}
                image={booking.unit.owner.image}
              />
            ) : (
              <ContactBlock
                name={booking.tenant.name}
                email={booking.tenant.email}
                phone={booking.tenant.phone}
                image={booking.tenant.image}
              />
            )}
          </div>

          {/* Existing review */}
          {booking.review && (
            <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5">
              <p className="text-[10px] uppercase tracking-wider text-[#717171] font-semibold mb-3">
                Your review
              </p>
              <div className="flex items-center gap-1.5 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-4 w-4 ${
                      n <= booking.review!.rating
                        ? "fill-[#E0484F] text-[#E0484F]"
                        : "text-[#E5E7EB]"
                    }`}
                  />
                ))}
              </div>
              {booking.review.comment && (
                <p className="text-sm text-[#222222] leading-relaxed">
                  {booking.review.comment}
                </p>
              )}
              <p className="text-xs text-[#9CA3AF] mt-2">
                Posted {formatDate(booking.review.createdAt)}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT — pricing + actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5">
            <p className="text-[10px] uppercase tracking-wider text-[#717171] font-semibold">
              Price details
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#717171]">
                <span>
                  {booking.durationType === "DAILY"
                    ? `${nights} ${nights === 1 ? "night" : "nights"}`
                    : booking.durationType.toLowerCase()}{" "}
                  rate
                </span>
                <span>{formatCurrency(booking.basePrice)}</span>
              </div>
              {booking.serviceFee > 0 && (
                <div className="flex justify-between text-[#717171]">
                  <span>Service fee</span>
                  <span>{formatCurrency(booking.serviceFee)}</span>
                </div>
              )}
              <div className="pt-3 mt-2 border-t border-[#F0F0F0] flex justify-between">
                <span className="font-semibold text-[#222222]">Total</span>
                <span className="font-bold text-[#222222]">
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            isOwner={isOwner}
            isTenant={isTenant}
            isAdmin={isAdmin}
            canCancel={isCancellable && (isTenant || isOwner || isAdmin)}
            canConfirm={booking.status === "PENDING" && (isOwner || isAdmin)}
            canReject={booking.status === "PENDING" && (isOwner || isAdmin)}
            canComplete={
              booking.status === "CONFIRMED" &&
              (isOwner || isAdmin) &&
              new Date(booking.checkOut) <= new Date()
            }
            canReview={canReview}
            checkoutPassed={new Date(booking.checkOut) <= new Date()}
          />
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-[#717171] mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-[#717171] uppercase tracking-wider font-semibold">
          {label}
        </p>
        <p className="text-[#222222]">{value}</p>
      </div>
    </div>
  );
}

function NoteBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 shrink-0 rounded-full bg-[#FDE8E4] text-[#C13947] flex items-center justify-center">
        <StickyNote className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[#717171] font-semibold">
          {label}
        </p>
        <p className="text-sm text-[#222222] mt-1 whitespace-pre-line">{body}</p>
      </div>
    </div>
  );
}

function ContactBlock({
  name,
  email,
  phone,
  image,
}: {
  name: string;
  email: string;
  phone: string | null;
  image?: string | null;
}) {
  return (
    <div className="mt-3 flex items-center gap-4">
      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-[#FDE8E4] text-[#C13947] flex items-center justify-center font-semibold">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-[#222222] truncate">{name}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#717171]">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1 hover:text-[#E0484F]"
          >
            <Mail className="h-3 w-3" />
            {email}
          </a>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1 hover:text-[#E0484F]"
            >
              <Phone className="h-3 w-3" />
              {phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
