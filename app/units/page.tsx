import { prisma } from "@/lib/prisma";
import { UnitCard } from "@/components/cards/unit-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

export const metadata = {
  title: "Browse Units",
};

type SearchParams = Promise<{
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  durationType?: string;
}>;

export default async function UnitsPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

  // Build filter conditions
  const where: Record<string, unknown> = {
    status: "ACTIVE",
  };

  if (searchParams.city) {
    where.city = {
      contains: searchParams.city,
      mode: "insensitive",
    };
  }

  if (searchParams.bedrooms) {
    where.bedrooms = {
      gte: parseInt(searchParams.bedrooms),
    };
  }

  // Fetch units
  const units = await prisma.unit.findMany({
    where,
    include: {
      photos: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: { reviews: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate average ratings
  const unitsWithRatings = await Promise.all(
    units.map(async (unit) => {
      const avgRating = await prisma.review.aggregate({
        where: { unitId: unit.id },
        _avg: { rating: true },
      });
      return {
        ...unit,
        averageRating: avgRating._avg.rating || 0,
      };
    })
  );

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Condo Units</h1>
        <p className="text-muted-foreground">
          Find the perfect place for your staycation or long-term stay
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by city..." className="pl-10" />
        </div>
        <Select defaultValue={searchParams.bedrooms || "any"}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any bedrooms</SelectItem>
            <SelectItem value="1">1+ bedroom</SelectItem>
            <SelectItem value="2">2+ bedrooms</SelectItem>
            <SelectItem value="3">3+ bedrooms</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue={searchParams.durationType || "daily"}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Stay type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily rates</SelectItem>
            <SelectItem value="weekly">Weekly rates</SelectItem>
            <SelectItem value="monthly">Monthly rates</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Results */}
      {unitsWithRatings.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {unitsWithRatings.length} unit
            {unitsWithRatings.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {unitsWithRatings.map((unit) => (
              <UnitCard key={unit.id} unit={unit} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-xl font-semibold mb-2">No units found</h2>
          <p className="text-muted-foreground">
            Try adjusting your filters or check back later for new listings
          </p>
        </div>
      )}
    </div>
  );
}
