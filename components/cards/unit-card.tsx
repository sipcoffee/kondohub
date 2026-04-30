import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Bed, Bath, Users, Star, Building2 } from "lucide-react";
import { WishlistHeart } from "@/components/cards/wishlist-heart";

type UnitCardProps = {
  unit: {
    id: string;
    slug: string;
    name: string;
    city: string;
    province: string;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    dailyRate: number | null;
    weeklyRate: number | null;
    monthlyRate: number | null;
    photos: { url: string; isPrimary: boolean }[];
    _count?: {
      reviews: number;
    };
    averageRating?: number;
  };
};

export function UnitCard({ unit }: UnitCardProps) {
  const primaryPhoto = unit.photos.find((p) => p.isPrimary) || unit.photos[0];
  const lowestRate = Math.min(
    ...[unit.dailyRate, unit.weeklyRate, unit.monthlyRate].filter(
      (r): r is number => r !== null,
    ),
  );

  const hasReviews = (unit._count?.reviews ?? 0) > 0;
  const flexibleRates = unit.dailyRate && unit.weeklyRate && unit.monthlyRate;

  return (
    <Link href={`/units/${unit.slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#F7F7F7]">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={unit.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 className="h-10 w-10 text-[#9CA3AF]" />
          </div>
        )}

        {/* Badge */}
        {flexibleRates && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white text-[11px] font-semibold text-[#222222] shadow-sm">
            Flexible rates
          </span>
        )}

        {/* Heart (client island so the parent stays a server component) */}
        <WishlistHeart />
      </div>

      {/* Meta */}
      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[15px] font-bold text-[#222222] leading-snug line-clamp-1">
            {unit.name}
          </h3>
          {hasReviews ? (
            <div className="inline-flex items-center gap-1 text-sm text-[#222222] shrink-0">
              <Star className="h-3.5 w-3.5 fill-[#222222]" />
              <span className="font-medium tabular-nums">
                {unit.averageRating?.toFixed(2)}
              </span>
              <span className="text-[#717171]">({unit._count?.reviews})</span>
            </div>
          ) : (
            <span className="text-xs text-[#9CA3AF] shrink-0">New</span>
          )}
        </div>
        <p className="text-sm text-[#717171] mt-0.5 line-clamp-1">
          {unit.city}, {unit.province}
        </p>

        <div className="flex items-center gap-3 mt-2 text-[13px] text-[#717171]">
          <span className="inline-flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" />
            {unit.bedrooms === 0
              ? "Studio"
              : `${unit.bedrooms} ${unit.bedrooms === 1 ? "bed" : "beds"}`}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" />
            {unit.bathrooms} {unit.bathrooms === 1 ? "bath" : "baths"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {unit.maxGuests}
          </span>
        </div>

        <p className="mt-3 text-[15px] text-[#222222]">
          <span className="font-semibold tabular-nums">
            {formatCurrency(lowestRate)}
          </span>
          <span className="text-[#717171]"> / night</span>
          {unit.monthlyRate && (
            <>
              <span className="text-[#717171]"> · </span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(unit.monthlyRate)}
              </span>
              <span className="text-[#717171]"> / mo</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
