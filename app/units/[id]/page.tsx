import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Star,
  Calendar,
  Square,
  Building2,
  Check,
} from "lucide-react";

type Params = Promise<{ id: string }>;

export async function generateMetadata(props: { params: Params }) {
  const params = await props.params;
  const unit = await prisma.unit.findFirst({
    where: {
      OR: [{ id: params.id }, { slug: params.id }],
    },
    select: { name: true, city: true, province: true },
  });

  if (!unit) return { title: "Unit Not Found" };

  return {
    title: `${unit.name} - ${unit.city}`,
    description: `Book ${unit.name} in ${unit.city}, ${unit.province}`,
  };
}

export default async function UnitDetailPage(props: { params: Params }) {
  const params = await props.params;

  const unit = await prisma.unit.findFirst({
    where: {
      OR: [{ id: params.id }, { slug: params.id }],
      status: "ACTIVE",
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      },
      photos: {
        orderBy: { order: "asc" },
      },
      amenities: {
        include: {
          amenity: true,
        },
      },
      reviews: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: { reviews: true, bookings: true },
      },
    },
  });

  if (!unit) {
    notFound();
  }

  // Calculate average rating
  const avgRating = await prisma.review.aggregate({
    where: { unitId: unit.id },
    _avg: { rating: true },
  });

  const primaryPhoto = unit.photos.find((p) => p.isPrimary) || unit.photos[0];
  const otherPhotos = unit.photos.filter((p) => p.id !== primaryPhoto?.id);

  return (
    <div className="container py-8">
      {/* Photo Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.url}
              alt={unit.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No image available
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {otherPhotos.slice(0, 4).map((photo, index) => (
            <div
              key={photo.id}
              className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted"
            >
              <Image
                src={photo.url}
                alt={`${unit.name} - Photo ${index + 2}`}
                fill
                className="object-cover"
              />
              {index === 3 && otherPhotos.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                  +{otherPhotos.length - 4} more
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              {unit.city}, {unit.province}
            </div>
            <h1 className="text-3xl font-bold mb-4">{unit.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                {unit.bedrooms} {unit.bedrooms === 1 ? "bedroom" : "bedrooms"}
              </span>
              <span className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                {unit.bathrooms} {unit.bathrooms === 1 ? "bathroom" : "bathrooms"}
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Up to {unit.maxGuests} guests
              </span>
              {unit.squareMeters && (
                <span className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  {unit.squareMeters} sqm
                </span>
              )}
              {unit.floor && (
                <span className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  Floor {unit.floor}
                </span>
              )}
              {avgRating._avg.rating && (
                <span className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                  {avgRating._avg.rating.toFixed(1)} ({unit._count.reviews}{" "}
                  reviews)
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Owner Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={unit.owner.image || undefined} />
              <AvatarFallback>
                {unit.owner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Hosted by {unit.owner.name}</p>
              <p className="text-sm text-muted-foreground">
                Member since {formatDate(unit.owner.createdAt)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4">About this place</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {unit.description}
            </p>
          </div>

          {/* Amenities */}
          {unit.amenities.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {unit.amenities.map(({ amenity }) => (
                    <div key={amenity.id} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Reviews */}
          <Separator />
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Reviews{" "}
              {unit._count.reviews > 0 && (
                <span className="text-muted-foreground font-normal">
                  ({unit._count.reviews})
                </span>
              )}
            </h2>
            {unit.reviews.length > 0 ? (
              <div className="space-y-6">
                {unit.reviews.map((review) => (
                  <div key={review.id} className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={review.tenant.image || undefined} />
                      <AvatarFallback>
                        {review.tenant.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.tenant.name}</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatDate(review.createdAt)}
                      </p>
                      {review.comment && <p>{review.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No reviews yet. Be the first to stay and review!
              </p>
            )}
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {unit.dailyRate && (
                <div className="flex justify-between items-center">
                  <span>Daily rate</span>
                  <span className="font-semibold">
                    {formatCurrency(unit.dailyRate)}/night
                  </span>
                </div>
              )}
              {unit.weeklyRate && (
                <div className="flex justify-between items-center">
                  <span>Weekly rate</span>
                  <span className="font-semibold">
                    {formatCurrency(unit.weeklyRate)}/week
                  </span>
                </div>
              )}
              {unit.monthlyRate && (
                <div className="flex justify-between items-center">
                  <span>Monthly rate</span>
                  <span className="font-semibold">
                    {formatCurrency(unit.monthlyRate)}/month
                  </span>
                </div>
              )}

              <Separator />

              <Button className="w-full" size="lg">
                <Calendar className="mr-2 h-4 w-4" />
                Check Availability
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You won&apos;t be charged yet
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
