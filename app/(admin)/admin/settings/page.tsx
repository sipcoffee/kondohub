import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings as SettingsIcon,
  Mail,
  Shield,
  Database,
  ExternalLink,
} from "lucide-react";

export const metadata = { title: "Platform settings" };

export default async function AdminSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure how the platform behaves.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SettingCard
          icon={SettingsIcon}
          title="Service fees"
          description="Set the platform service fee taken from each booking. Currently 0%."
        />
        <SettingCard
          icon={Mail}
          title="Email & notifications"
          description="Connect a transactional email provider (Resend, SES) to power booking and review notifications."
        />
        <SettingCard
          icon={Shield}
          title="Identity verification"
          description="Require government ID upload for owners before going active."
        />
        <SettingCard
          icon={Database}
          title="Data export"
          description="Download CSVs of users, units, and bookings for compliance and reporting."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Heads-up</CardTitle>
          <CardDescription>
            None of these settings are wired yet — they&apos;re placeholders for the
            next milestone. Each card maps to a capability we&apos;ll bolt on once
            the core flow is stable.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          See PLAN.md for the roadmap.
        </CardContent>
      </Card>
    </div>
  );
}

function SettingCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#FDE8E4] text-[#C13947] flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        <Button size="sm" variant="outline" disabled>
          Coming soon
        </Button>
      </CardContent>
    </Card>
  );
}
