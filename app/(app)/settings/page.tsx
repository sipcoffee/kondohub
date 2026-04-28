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
import { formatDate } from "@/lib/utils";
import { Lock, Mail } from "lucide-react";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/settings");

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
        <h1 className="text-3xl font-bold">Account settings</h1>
        <p className="text-muted-foreground mt-1">
          Update your profile and account preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This is what hosts and guests see on bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Read-only details about your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row
            icon={Mail}
            label="Email verification"
            value={
              user.emailVerified ? "Verified" : "Pending — check your inbox"
            }
          />
          <Row
            icon={Lock}
            label="Account type"
            value={(user.role as string).toLowerCase()}
          />
          <Row
            icon={Lock}
            label="Member since"
            value={formatDate(user.createdAt)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Account deletion is currently handled by support — drop us a line at{" "}
            <a
              href="mailto:support@kondohub.example"
              className="text-[#E0484F] hover:underline"
            >
              support@kondohub.example
            </a>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#F0F0F0] py-2 last:border-0">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
