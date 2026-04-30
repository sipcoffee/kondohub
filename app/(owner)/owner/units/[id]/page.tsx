import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UnitForm } from "@/components/forms/unit-form";
import { ArrowLeft, ImagePlus, CalendarRange, Eye } from "lucide-react";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Edit unit" };

const STATUS_PILL: Record<string, string> = {
  DRAFT: "bg-[#F7F7F7] text-[#717171] border border-[#EBEBEB]",
  ACTIVE: "bg-[#DFF0EE] text-[#1F5E58] border border-transparent",
  INACTIVE: "bg-[#FFF4D6] text-[#7A5A00] border border-transparent",
  UNDER_MAINTENANCE: "bg-[#FDE8E4] text-[#C13947] border border-transparent",
};

export default async function EditUnitPage(props: { params: Params }) {
  const { id } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const unit = await prisma.unit.findUnique({ where: { id } });
  if (!unit) notFound();

  const userRole = (session.user.role as string) || "TENANT";
  if (unit.ownerId !== session.user.id && userRole !== "ADMIN") notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/owner/units"
          className="inline-flex items-center gap-1.5 text-sm text-[#717171] hover:text-[#222222] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my condos
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-2">
              Edit listing
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#222222] leading-[1.05]">
              {unit.name}
            </h1>
            <p className="mt-2 text-sm text-[#717171]">
              {unit.city}, {unit.province}
            </p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${STATUS_PILL[unit.status] ?? STATUS_PILL.DRAFT}`}
          >
            {unit.status.replace("_", " ").toLowerCase()}
          </span>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Link
          href={`/owner/units/${unit.id}/photos`}
          className="group rounded-2xl border border-[#EBEBEB] bg-white p-5 transition-all hover:border-[#222222] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]"
        >
          <div className="h-10 w-10 rounded-xl bg-[#FDE8E4] text-[#C13947] flex items-center justify-center mb-3 transition-transform group-hover:scale-110">
            <ImagePlus className="h-4 w-4" />
          </div>
          <p className="font-display text-base font-bold text-[#222222]">
            Photos
          </p>
          <p className="text-xs text-[#717171] mt-0.5">Manage the gallery</p>
        </Link>
        <Link
          href={`/owner/units/${unit.id}/calendar`}
          className="group rounded-2xl border border-[#EBEBEB] bg-white p-5 transition-all hover:border-[#222222] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]"
        >
          <div className="h-10 w-10 rounded-xl bg-[#DFF0EE] text-[#1F5E58] flex items-center justify-center mb-3 transition-transform group-hover:scale-110">
            <CalendarRange className="h-4 w-4" />
          </div>
          <p className="font-display text-base font-bold text-[#222222]">
            Availability
          </p>
          <p className="text-xs text-[#717171] mt-0.5">Block out dates</p>
        </Link>
        {unit.status === "ACTIVE" && (
          <Link
            href={`/units/${unit.slug}`}
            className="group rounded-2xl border border-[#EBEBEB] bg-white p-5 transition-all hover:border-[#222222] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]"
          >
            <div className="h-10 w-10 rounded-xl bg-[#E4EEF5] text-[#2C4A6B] flex items-center justify-center mb-3 transition-transform group-hover:scale-110">
              <Eye className="h-4 w-4" />
            </div>
            <p className="font-display text-base font-bold text-[#222222]">
              Public page
            </p>
            <p className="text-xs text-[#717171] mt-0.5">View as a guest</p>
          </Link>
        )}
      </div>

      <UnitForm
        mode="edit"
        initialData={{
          id: unit.id,
          name: unit.name,
          description: unit.description,
          address: unit.address,
          city: unit.city,
          province: unit.province,
          zipCode: unit.zipCode ?? "",
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          maxGuests: unit.maxGuests,
          squareMeters: unit.squareMeters,
          floor: unit.floor,
          dailyRate: unit.dailyRate,
          weeklyRate: unit.weeklyRate,
          monthlyRate: unit.monthlyRate,
          status:
            unit.status === "UNDER_MAINTENANCE"
              ? "INACTIVE"
              : (unit.status as "DRAFT" | "ACTIVE" | "INACTIVE"),
        }}
      />
    </div>
  );
}
