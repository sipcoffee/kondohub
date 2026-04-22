import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UnitForm } from "@/components/forms/unit-form";

export const metadata = {
  title: "Add New Unit",
};

export default async function NewUnitPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Unit</h1>
        <p className="text-muted-foreground mt-1">
          Create a new condo unit listing
        </p>
      </div>

      <UnitForm mode="create" />
    </div>
  );
}
