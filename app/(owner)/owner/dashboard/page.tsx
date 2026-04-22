import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  TrendingUp,
  Clock,
  Plus,
} from "lucide-react";

export const metadata = {
  title: "Owner Dashboard",
};

export default async function OwnerDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your units and bookings
          </p>
        </div>
        <Button asChild>
          <Link href="/owner/units/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Unit
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">0 active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PHP 0</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/owner/units/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Unit
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/owner/units">Manage Units</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/owner/bookings">View Bookings</Link>
          </Button>
        </CardContent>
      </Card>

      {/* My Units */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Units</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/owner/units">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No units yet</p>
            <p className="text-sm mt-1">
              Start by adding your first condo unit
            </p>
            <Button className="mt-4" asChild>
              <Link href="/owner/units/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Unit
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Booking Requests</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/owner/bookings">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No booking requests</p>
            <p className="text-sm mt-1">
              Booking requests will appear here once tenants start booking
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
