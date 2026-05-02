import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UnitCard } from "@/components/cards/unit-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, Sparkles, Building2 } from "lucide-react";

export const metadata = {
  title: "Browse condos",
};

type SearchParams = Promise<{
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  durationType?: string;
}>;

const POPULAR_CITIES = [
  "Makati",
  "Taguig",
  "Cebu City",
  "Quezon City",
  "Tagaytay",
  "Malay",
];

export default async function UnitsPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

  const where: Record<string, unknown> = {
    status: "ACTIVE",
  };
  if (searchParams.city) {
    where.city = { contains: searchParams.city, mode: "insensitive" };
  }
  if (searchParams.bedrooms) {
    where.bedrooms = { gte: parseInt(searchParams.bedrooms) };
  }

  const units = await prisma.unit.findMany({
    where,
    include: {
      photos: { orderBy: { order: "asc" } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

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
    }),
  );

  const activeCity = searchParams.city ?? "";

  return (
    <div className="bg-white text-[#222222]">
      {/* Hero search panel */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF4F0] via-[#FFF9F6] to-white">
        <div
          className="absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#FDE8E4] blur-3xl opacity-70"
          aria-hidden
        />
        <div
          className="absolute -bottom-40 -left-24 h-[32rem] w-[32rem] rounded-full bg-[#FFE9D6] blur-3xl opacity-60"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-16 pb-10 md:pb-14">
          <div className="max-w-2xl float-in">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-3">
              <Sparkles className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              {unitsWithRatings.length} verified condos
            </p>
            <h1 className="font-display text-[2.25rem] sm:text-5xl md:text-[3.5rem] font-extrabold leading-[1.05] text-[#222222]">
              Find a{" "}
              <span className="relative inline-block">
                <span className="relative z-10">condo</span>
                <span
                  className="absolute left-0 right-0 bottom-1 md:bottom-1.5 h-2.5 md:h-3 bg-[#FDD3CB] z-0 rounded-sm"
                  aria-hidden
                />
              </span>{" "}
              you&apos;ll actually love.
            </h1>
            <p className="mt-4 text-sm md:text-base text-[#717171] leading-relaxed max-w-xl">
              Handpicked, verified condominiums in every major city — booked by
              the night, the week, or the month.
            </p>
          </div>

          {/* Search form */}
          <form
            className="relative max-w-4xl mt-8 md:mt-10 float-in"
            style={{ animationDelay: "120ms" }}
            method="get"
          >
            <div className="flex flex-col md:flex-row md:items-stretch rounded-3xl md:rounded-full bg-white border border-[#E5E7EB] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] overflow-hidden">
              <label className="group flex-1 flex flex-col gap-0.5 px-6 py-3.5 hover:bg-[#F7F7F7] cursor-text transition-colors">
                <span className="text-[10px] font-semibold text-[#222222] uppercase tracking-[0.14em]">
                  Where
                </span>
                <input
                  type="text"
                  name="city"
                  defaultValue={searchParams.city ?? ""}
                  placeholder="Makati, BGC, Cebu, Boracay…"
                  className="bg-transparent border-0 outline-none text-sm text-[#222222] placeholder:text-[#9CA3AF]"
                />
              </label>

              <div className="hidden md:block w-px bg-[#EBEBEB] my-2" />

              <label className="group flex-1 flex flex-col gap-0.5 px-6 py-3.5 hover:bg-[#F7F7F7] cursor-text transition-colors">
                <span className="text-[10px] font-semibold text-[#222222] uppercase tracking-[0.14em]">
                  Bedrooms
                </span>
                <select
                  name="bedrooms"
                  defaultValue={searchParams.bedrooms ?? ""}
                  className="bg-transparent border-0 outline-none text-sm text-[#222222] appearance-none cursor-pointer"
                >
                  <option value="">Any</option>
                  <option value="1">1+ bedroom</option>
                  <option value="2">2+ bedrooms</option>
                  <option value="3">3+ bedrooms</option>
                </select>
              </label>

              <div className="hidden md:block w-px bg-[#EBEBEB] my-2" />

              <label className="group flex-1 flex flex-col gap-0.5 px-6 py-3.5 hover:bg-[#F7F7F7] cursor-text transition-colors">
                <span className="text-[10px] font-semibold text-[#222222] uppercase tracking-[0.14em]">
                  Stay type
                </span>
                <select
                  name="durationType"
                  defaultValue={searchParams.durationType ?? "daily"}
                  className="bg-transparent border-0 outline-none text-sm text-[#222222] appearance-none cursor-pointer"
                >
                  <option value="daily">Daily rates</option>
                  <option value="weekly">Weekly rates</option>
                  <option value="monthly">Monthly rates</option>
                </select>
              </label>

              <div className="flex md:items-center justify-end p-3 md:p-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 w-full md:w-auto md:h-12 md:px-7 py-3 rounded-full bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
                >
                  <Search className="h-4 w-4" strokeWidth={2.5} />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </form>

          {/* Popular city pills */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#717171] mr-1">Popular:</span>
            <Link
              href="/units"
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                !activeCity
                  ? "bg-[#222222] text-white border-[#222222] font-medium"
                  : "bg-white text-[#222222] border-[#E5E7EB] hover:border-[#222222]"
              }`}
            >
              All
            </Link>
            {POPULAR_CITIES.map((c) => {
              const active = activeCity.toLowerCase() === c.toLowerCase();
              return (
                <Link
                  key={c}
                  href={`/units?city=${encodeURIComponent(c)}`}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    active
                      ? "bg-[#222222] text-white border-[#222222] font-medium"
                      : "bg-white text-[#222222] border-[#E5E7EB] hover:border-[#222222]"
                  }`}
                >
                  {c}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-14">
        {unitsWithRatings.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 md:mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-2">
                  {activeCity ? activeCity : "Available now"}
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#222222]">
                  {unitsWithRatings.length}{" "}
                  {unitsWithRatings.length === 1 ? "condo" : "condos"} ready to
                  book
                </h2>
              </div>
              <Select defaultValue="recent">
                <SelectTrigger className="w-full sm:w-auto h-10 rounded-full border-[#E5E7EB] bg-white px-4 hover:border-[#222222] transition-colors gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Newest first</SelectItem>
                  <SelectItem value="priceLow">Price: low to high</SelectItem>
                  <SelectItem value="priceHigh">Price: high to low</SelectItem>
                  <SelectItem value="rating">Top rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {unitsWithRatings.map((unit) => (
                <UnitCard key={unit.id} unit={unit} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-[#EBEBEB] bg-white p-16 text-center">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-[#FDE8E4] text-[#C13947] flex items-center justify-center mb-5">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-[#222222]">
              No condos match
            </h2>
            <p className="mt-2 text-[#717171] max-w-md mx-auto">
              Try clearing the city filter or widening your search — new
              listings are added every week.
            </p>
            <Link
              href="/units"
              className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-5 py-3 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
            >
              <Search className="h-4 w-4" strokeWidth={2.5} />
              See all condos
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
