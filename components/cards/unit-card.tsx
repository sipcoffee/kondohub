import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Bed, Bath, Users, Star } from "lucide-react";

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
      (r): r is number => r !== null
    )
  );

  return (
    <Link href={`/units/${unit.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-muted">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.url}
              alt={unit.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No image
            </div>
          )}
          {unit.dailyRate && unit.weeklyRate && unit.monthlyRate && (
            <Badge className="absolute top-2 right-2">Flexible Rates</Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Location */}
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <MapPin className="h-3 w-3 mr-1" />
            {unit.city}, {unit.province}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-lg line-clamp-1">{unit.name}</h3>

          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center">
              <Bed className="h-3 w-3 mr-1" />
              {unit.bedrooms} {unit.bedrooms === 1 ? "bed" : "beds"}
            </span>
            <span className="flex items-center">
              <Bath className="h-3 w-3 mr-1" />
              {unit.bathrooms} {unit.bathrooms === 1 ? "bath" : "baths"}
            </span>
            <span className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {unit.maxGuests} guests
            </span>
          </div>

          {/* Rating & Price */}
          <div className="flex items-center justify-between mt-4">
            {unit._count?.reviews && unit._count.reviews > 0 ? (
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="font-medium">
                  {unit.averageRating?.toFixed(1)}
                </span>
                <span className="text-muted-foreground ml-1">
                  ({unit._count.reviews})
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No reviews</span>
            )}
            <div className="text-right">
              <span className="font-bold">{formatCurrency(lowestRate)}</span>
              <span className="text-sm text-muted-foreground">/night</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
