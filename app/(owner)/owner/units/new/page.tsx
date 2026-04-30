import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UnitForm } from "@/components/forms/unit-form";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Add new unit",
};

export default async function NewUnitPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          href="/owner/units"
          className="inline-flex items-center gap-1.5 text-sm text-[#717171] hover:text-[#222222] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my condos
        </Link>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-2">
            New listing
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#222222] leading-[1.05]">
            Add a new condo
          </h1>
          <p className="mt-3 text-[#717171] max-w-xl">
            Four short steps. You can save as a draft anytime and finish later
            in the edit view.
          </p>
        </div>
      </div>

      <UnitForm mode="create" />
    </div>
  );
}
