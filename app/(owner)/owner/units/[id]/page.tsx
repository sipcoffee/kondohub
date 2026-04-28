import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UnitForm } from "@/components/forms/unit-form";
import { ArrowLeft, ImagePlus, CalendarRange, Eye } from "lucide-react";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Edit unit" };

export default async function EditUnitPage(props: { params: Params }) {
  const { id } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const unit = await prisma.unit.findUnique({ where: { id } });
  if (!unit) notFound();

  const userRole = (session.user.role as string) || "TENANT";
  if (unit.ownerId !== session.user.id && userRole !== "ADMIN") notFound();

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link
          href="/owner/units"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          My units
        </Link>
        <div className="mt-3">
          <h1 className="text-3xl font-bold">Edit unit</h1>
          <p className="text-muted-foreground mt-1">
            Update details, pricing and status
          </p>
        </div>
      </div>

      {/* Quick links to nested editors */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Link
          href={`/owner/units/${unit.id}/photos`}
          className="group rounded-xl border border-[#EBEBEB] bg-white p-4 hover:border-[#222222] hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.12)] transition-all"
        >
          <div className="h-9 w-9 rounded-lg bg-[#FDE8E4] text-[#C13947] flex items-center justify-center mb-3">
            <ImagePlus className="h-4 w-4" />
          </div>
          <p className="font-semibold text-sm">Photos</p>
          <p className="text-xs text-muted-foreground mt-0.5">Manage gallery</p>
        </Link>
        <Link
          href={`/owner/units/${unit.id}/calendar`}
          className="group rounded-xl border border-[#EBEBEB] bg-white p-4 hover:border-[#222222] hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.12)] transition-all"
        >
          <div className="h-9 w-9 rounded-lg bg-[#E6F7EC] text-[#1F6E3A] flex items-center justify-center mb-3">
            <CalendarRange className="h-4 w-4" />
          </div>
          <p className="font-semibold text-sm">Availability</p>
          <p className="text-xs text-muted-foreground mt-0.5">Block dates</p>
        </Link>
        {unit.status === "ACTIVE" && (
          <Link
            href={`/units/${unit.slug}`}
            className="group rounded-xl border border-[#EBEBEB] bg-white p-4 hover:border-[#222222] hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.12)] transition-all"
          >
            <div className="h-9 w-9 rounded-lg bg-[#E6EFFB] text-[#234B8A] flex items-center justify-center mb-3">
              <Eye className="h-4 w-4" />
            </div>
            <p className="font-semibold text-sm">Public page</p>
            <p className="text-xs text-muted-foreground mt-0.5">View as guest</p>
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
