import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/forms/profile-form";
import { Wallet, Bell, ShieldCheck } from "lucide-react";

export const metadata = { title: "Owner settings" };

export default async function OwnerSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/owner/settings");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      image: true,
      emailVerified: true,
      createdAt: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Owner settings</h1>
        <p className="text-muted-foreground mt-1">
          Profile, payouts, and host preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            What guests see on your listings and bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-3 gap-3">
        <PlaceholderTile
          icon={Wallet}
          title="Payouts"
          body="Add bank account or e-wallet for monthly payouts."
        />
        <PlaceholderTile
          icon={Bell}
          title="Notifications"
          body="Booking alerts via email and SMS."
        />
        <PlaceholderTile
          icon={ShieldCheck}
          title="Verification"
          body="Upload IDs to earn the verified host badge."
        />
      </div>
    </div>
  );
}

function PlaceholderTile({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-5">
      <div className="h-9 w-9 rounded-lg bg-white border border-[#EBEBEB] flex items-center justify-center mb-3">
        <Icon className="h-4 w-4 text-[#717171]" />
      </div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{body}</p>
      <p className="mt-3 text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold">
        Coming soon
      </p>
    </div>
  );
}
