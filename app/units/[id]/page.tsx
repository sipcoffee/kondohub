import { notFound } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { BookingForm } from "@/components/forms/booking-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Star,
  Square,
  Building2,
  Check,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

type Params = Promise<{ id: string }>;

export async function generateMetadata(props: { params: Params }) {
  const params = await props.params;
  const unit = await prisma.unit.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    select: { name: true, city: true, province: true },
  });
  if (!unit) return { title: "Unit not found" };
  return {
    title: `${unit.name} · ${unit.city}`,
    description: `Book ${unit.name} in ${unit.city}, ${unit.province}`,
  };
}

export default async function UnitDetailPage(props: { params: Params }) {
  const { id } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });

  const unit = await prisma.unit.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      status: "ACTIVE",
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true, image: true, createdAt: true },
      },
      photos: { orderBy: { order: "asc" } },
      amenities: { include: { amenity: true } },
      reviews: {
        include: { tenant: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      _count: { select: { reviews: true, bookings: true } },
    },
  });

  if (!unit) notFound();

  const avgRating = await prisma.review.aggregate({
    where: { unitId: unit.id },
    _avg: { rating: true },
  });

  // Active bookings on this unit → derive blocked dates (server-side, ranges)
  const activeBookings = await prisma.booking.findMany({
    where: {
      unitId: unit.id,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { checkIn: true, checkOut: true },
  });
  const blockedDates = enumerateBlockedDates(activeBookings);

  const primaryPhoto = unit.photos.find((p) => p.isPrimary) || unit.photos[0];
  const otherPhotos = unit.photos.filter((p) => p.id !== primaryPhoto?.id).slice(0, 4);

  const isAuthenticated = !!session?.user;
  const isOwnUnit = session?.user?.id === unit.owner.id;

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 py-8 md:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl md:text-4xl font-extrabold text-[#222222] tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {unit.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#717171]">
          {avgRating._avg.rating !== null && (
            <span className="inline-flex items-center gap-1 text-[#222222]">
              <Star className="h-3.5 w-3.5 fill-[#222222]" />
              <span className="font-semibold">{avgRating._avg.rating.toFixed(2)}</span>
              <span className="text-[#717171]">({unit._count.reviews})</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {unit.city}, {unit.province}
          </span>
          <span>· Hosted by {unit.owner.name}</span>
        </div>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden mb-10 max-h-[28rem]">
        <div className="relative md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto bg-[#F7F7F7]">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.url}
              alt={unit.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#9CA3AF]">
              <Building2 className="h-12 w-12" />
            </div>
          )}
        </div>
        {[0, 1, 2, 3].map((i) => {
          const photo = otherPhotos[i];
          return (
            <div
              key={i}
              className="relative aspect-[4/3] bg-[#F7F7F7] hidden md:block"
            >
              {photo ? (
                <Image
                  src={photo.url}
                  alt={`${unit.name} photo ${i + 2}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#9CA3AF]">
                  <Building2 className="h-6 w-6" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* LEFT — content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Specs */}
          <section className="pb-8 border-b border-[#EBEBEB]">
            <p className="text-[#717171] text-sm">
              Hosted by <span className="text-[#222222] font-semibold">{unit.owner.name}</span> · joined{" "}
              {formatDate(unit.owner.createdAt)}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#222222]">
              <span className="inline-flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-[#717171]" />
                {unit.bedrooms} {unit.bedrooms === 1 ? "bedroom" : "bedrooms"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-[#717171]" />
                {unit.bathrooms} {unit.bathrooms === 1 ? "bathroom" : "bathrooms"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-[#717171]" />
                Up to {unit.maxGuests} guests
              </span>
              {unit.squareMeters && (
                <span className="inline-flex items-center gap-1.5">
                  <Square className="h-4 w-4 text-[#717171]" />
                  {unit.squareMeters} sqm
                </span>
              )}
              {unit.floor && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-[#717171]" />
                  Floor {unit.floor}
                </span>
              )}
            </div>
          </section>

          {/* Selling points */}
          <section className="pb-8 border-b border-[#EBEBEB] grid sm:grid-cols-3 gap-5">
            <FeatureCallout
              icon={ShieldCheck}
              title="Verified by kondohub"
              body="Personally inspected by our team."
            />
            <FeatureCallout
              icon={Sparkles}
              title="Honest pricing"
              body="What you see is what you pay."
            />
            <FeatureCallout
              icon={Star}
              title="Trusted host"
              body={`${unit._count.bookings} stays · ${unit._count.reviews} reviews`}
            />
          </section>

          {/* Description */}
          <section className="pb-8 border-b border-[#EBEBEB]">
            <h2
              className="text-2xl font-extrabold text-[#222222] tracking-[-0.02em] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              About this place
            </h2>
            <p className="text-[#222222] leading-relaxed whitespace-pre-line">
              {unit.description}
            </p>
          </section>

          {/* Amenities */}
          {unit.amenities.length > 0 && (
            <section className="pb-8 border-b border-[#EBEBEB]">
              <h2
                className="text-2xl font-extrabold text-[#222222] tracking-[-0.02em] mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What this place offers
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {unit.amenities.map(({ amenity }) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2.5 text-sm text-[#222222] py-2"
                  >
                    <Check className="h-4 w-4 text-[#1F6E3A]" />
                    {amenity.name}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
              <h2
                className="text-2xl font-extrabold text-[#222222] tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Reviews
                {avgRating._avg.rating !== null && (
                  <span className="ml-3 inline-flex items-center gap-1 text-base font-medium text-[#222222]">
                    <Star className="h-4 w-4 fill-[#222222]" />
                    {avgRating._avg.rating.toFixed(2)} · {unit._count.reviews}
                  </span>
                )}
              </h2>
            </div>
            {unit.reviews.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {unit.reviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.tenant.image || undefined} />
                        <AvatarFallback className="bg-[#FDE8E4] text-[#C13947] font-semibold">
                          {review.tenant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-[#222222] text-sm">
                          {review.tenant.name}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating
                              ? "fill-[#222222] text-[#222222]"
                              : "text-[#E5E7EB]"
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-[#222222] leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#717171]">
                No reviews yet — be the first to stay and review.
              </p>
            )}
          </section>
        </div>

        {/* RIGHT — booking */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <BookingForm
              unitId={unit.id}
              unitStatus={unit.status}
              maxGuests={unit.maxGuests}
              dailyRate={unit.dailyRate}
              weeklyRate={unit.weeklyRate}
              monthlyRate={unit.monthlyRate}
              blockedDates={blockedDates}
              isAuthenticated={isAuthenticated}
              isOwnUnit={isOwnUnit}
              callbackUrl={`/units/${unit.slug}`}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function FeatureCallout({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-[#FDE8E4] text-[#C13947] flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-[#222222] text-sm">{title}</p>
        <p className="text-xs text-[#717171] mt-0.5 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function enumerateBlockedDates(
  ranges: { checkIn: Date; checkOut: Date }[]
): Date[] {
  const dates: Date[] = [];
  for (const r of ranges) {
    const d = new Date(r.checkIn);
    d.setHours(0, 0, 0, 0);
    const end = new Date(r.checkOut);
    end.setHours(0, 0, 0, 0);
    while (d < end) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
  }
  return dates;
}
