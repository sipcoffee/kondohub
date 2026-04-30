import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PhotoUploader } from "@/components/forms/photo-uploader";
import { ArrowLeft } from "lucide-react";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Photos" };

export default async function UnitPhotosPage(props: { params: Params }) {
  const { id } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      photos: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
    },
  });
  if (!unit) notFound();

  const userRole = (session.user.role as string) || "TENANT";
  if (unit.ownerId !== session.user.id && userRole !== "ADMIN") notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href={`/owner/units/${unit.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#717171] hover:text-[#222222] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to unit
        </Link>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-2">
            Photo gallery
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#222222] leading-[1.05]">
            {unit.name}
          </h1>
          <p className="mt-3 text-[#717171] max-w-xl">
            Upload, reorder, and pick a cover photo. The cover is the first
            image guests see in search results.
          </p>
        </div>
      </div>

      <PhotoUploader unitId={unit.id} initialPhotos={unit.photos} />
    </div>
  );
}
