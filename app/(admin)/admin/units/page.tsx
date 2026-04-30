import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Eye, Pencil, MoreHorizontal, Star } from "lucide-react";

export const metadata = { title: "All units" };

const STATUS_PILL: Record<string, string> = {
  DRAFT: "bg-[#F7F7F7] text-[#717171] border border-[#EBEBEB]",
  ACTIVE: "bg-[#DFF0EE] text-[#1F5E58] border border-transparent",
  INACTIVE: "bg-[#FFF4D6] text-[#7A5A00] border border-transparent",
  UNDER_MAINTENANCE: "bg-[#FDE8E4] text-[#C13947] border border-transparent",
};

export default async function AdminUnitsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") redirect("/dashboard");

  const units = await prisma.unit.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      photos: { where: { isPrimary: true }, take: 1 },
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { bookings: true, reviews: true } },
    },
  });

  const activeCount = units.filter((u) => u.status === "ACTIVE").length;

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="admin"
        eyebrow="Inventory"
        title="All units"
        highlight="units"
        subtitle={`${units.length} listings across the platform · ${activeCount} active`}
      />

      {units.length === 0 ? (
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-12 text-center">
          <div className="h-12 w-12 mx-auto rounded-xl bg-[#F7F7F7] text-[#222222] flex items-center justify-center mb-4">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#222222]">
            No units yet
          </h3>
          <p className="mt-2 text-sm text-[#717171] max-w-sm mx-auto">
            Once owners publish listings they'll appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((u) => {
            const lowest = Math.min(
              ...[u.dailyRate, u.weeklyRate, u.monthlyRate].filter(
                (r): r is number => r !== null,
              ),
            );
            return (
              <div
                key={u.id}
                className="group relative flex flex-col rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden transition-all hover:border-[#222222] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]"
              >
                <Link
                  href={`/owner/units/${u.id}`}
                  className="relative block aspect-[4/3] bg-[#F7F7F7]"
                >
                  {u.photos[0] ? (
                    <Image
                      src={u.photos[0].url}
                      alt={u.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building2 className="h-8 w-8 text-[#9CA3AF]" />
                    </div>
                  )}
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${STATUS_PILL[u.status] ?? STATUS_PILL.DRAFT}`}
                  >
                    {u.status.replace("_", " ").toLowerCase()}
                  </span>
                </Link>

                <div className="absolute top-3 right-3 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Unit actions"
                      className="h-8 w-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4 text-[#222222]" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {u.status === "ACTIVE" && (
                        <DropdownMenuItem asChild>
                          <Link href={`/units/${u.slug}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View public page
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/owner/units/${u.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit unit
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex-1 flex flex-col p-5 gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#222222] line-clamp-1">
                      {u.name}
                    </h3>
                    <p className="text-sm text-[#717171] mt-0.5 line-clamp-1">
                      {u.city}, {u.province}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAFAFA] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-[#717171] font-bold">
                      Owned by
                    </p>
                    <p className="text-sm text-[#222222] truncate font-medium">
                      {u.owner.name}
                    </p>
                    <p className="text-[11px] text-[#717171] truncate">
                      {u.owner.email}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-[#EBEBEB] flex items-end justify-between">
                    <div>
                      {Number.isFinite(lowest) ? (
                        <p className="font-display text-lg font-extrabold text-[#222222] tabular-nums">
                          {formatCurrency(lowest)}
                          <span className="text-sm font-normal text-[#717171]">
                            {" "}
                            from
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-[#717171]">No rate</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#717171]">
                      <span className="inline-flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-wider font-bold">
                          Bookings
                        </span>
                        <span className="font-display text-sm font-extrabold text-[#222222] tabular-nums">
                          {u._count.bookings}
                        </span>
                      </span>
                      <span className="inline-flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-wider font-bold inline-flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Reviews
                        </span>
                        <span className="font-display text-sm font-extrabold text-[#222222] tabular-nums">
                          {u._count.reviews}
                        </span>
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#9CA3AF]">
                    Listed {formatDateShort(u.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
