import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Building2,
  BedDouble,
  Bath,
  Users,
} from "lucide-react";

export const metadata = {
  title: "My Condos",
};

const STATUS_PILL: Record<string, string> = {
  DRAFT: "bg-[#F7F7F7] text-[#717171] border border-[#EBEBEB]",
  ACTIVE: "bg-[#DFF0EE] text-[#1F5E58] border border-transparent",
  INACTIVE: "bg-[#FFF4D6] text-[#7A5A00] border border-transparent",
  UNDER_MAINTENANCE: "bg-[#FDE8E4] text-[#C13947] border border-transparent",
};

export default async function OwnerUnitsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const units = await prisma.unit.findMany({
    where: { ownerId: session.user.id },
    include: {
      photos: { where: { isPrimary: true }, take: 1 },
      _count: { select: { bookings: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeCount = units.filter((u) => u.status === "ACTIVE").length;

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="owner"
        eyebrow="My condos"
        title="Your listings"
        highlight="listings"
        subtitle={
          units.length > 0
            ? `${units.length} ${units.length === 1 ? "unit" : "units"} on KondoHub · ${activeCount} active`
            : "Get your first condo listed in under 10 minutes."
        }
        cta={
          <Link
            href="/owner/units/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-5 py-3 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add new unit
          </Link>
        }
      />

      {units.length === 0 ? (
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-16 text-center">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-[#DFF0EE] text-[#1F5E58] flex items-center justify-center mb-5">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="font-display text-2xl font-extrabold text-[#222222]">
            No units yet
          </h3>
          <p className="mt-2 text-[#717171] max-w-md mx-auto">
            Add your first condo and start receiving booking requests within 24
            hours of approval.
          </p>
          <Link
            href="/owner/units/new"
            className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-6 py-3 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add your first unit
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="group relative flex flex-col rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden transition-all hover:border-[#222222] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]"
            >
              <Link
                href={`/owner/units/${unit.id}`}
                className="relative block aspect-[4/3] bg-[#F7F7F7]"
              >
                {unit.photos[0] ? (
                  <Image
                    src={unit.photos[0].url}
                    alt={unit.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 className="h-8 w-8 text-[#9CA3AF]" />
                  </div>
                )}
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${STATUS_PILL[unit.status] ?? STATUS_PILL.DRAFT}`}
                >
                  {unit.status.replace("_", " ").toLowerCase()}
                </span>
              </Link>

              {/* Floating action menu — kept outside the Link so it doesn't trigger navigation */}
              <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Unit actions"
                    className="h-8 w-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4 text-[#222222]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/units/${unit.slug}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View public page
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/owner/units/${unit.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit unit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete unit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex-1 flex flex-col p-5 gap-4">
                <Link href={`/owner/units/${unit.id}`} className="block">
                  <h3 className="font-display text-lg font-bold text-[#222222] line-clamp-1">
                    {unit.name}
                  </h3>
                  <p className="text-sm text-[#717171] mt-0.5 line-clamp-1">
                    {unit.city}, {unit.province}
                  </p>
                </Link>

                <div className="flex items-center gap-4 text-xs text-[#717171]">
                  <span className="inline-flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5" />
                    {unit.bedrooms} BR
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Bath className="h-3.5 w-3.5" />
                    {unit.bathrooms} BA
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {unit.maxGuests}
                  </span>
                </div>

                <div className="mt-auto pt-4 border-t border-[#EBEBEB] flex items-end justify-between">
                  <div>
                    {unit.dailyRate ? (
                      <>
                        <p className="font-display text-lg font-extrabold text-[#222222] tabular-nums">
                          {formatCurrency(unit.dailyRate)}
                          <span className="text-sm font-normal text-[#717171]">
                            {" "}
                            / night
                          </span>
                        </p>
                        {unit.monthlyRate && (
                          <p className="text-xs text-[#717171] mt-0.5 tabular-nums">
                            {formatCurrency(unit.monthlyRate)} / mo
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-[#717171]">No rate set</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-[#717171] font-semibold">
                      Bookings
                    </p>
                    <p className="font-display text-lg font-extrabold text-[#222222] tabular-nums">
                      {unit._count.bookings}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-[#9CA3AF]">
                  Listed {formatDateShort(unit.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
