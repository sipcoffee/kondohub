import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

export const metadata = { title: "All bookings" };

export default async function AdminBookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") redirect("/dashboard");

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      unit: { select: { id: true, name: true, city: true, slug: true } },
      tenant: { select: { id: true, name: true, email: true } },
    },
  });

  const totalRevenue = bookings
    .filter((b) => ["CONFIRMED", "COMPLETED"].includes(b.status))
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">All bookings</h1>
        <p className="text-muted-foreground mt-1">
          Cross-platform booking activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatTile label="Total bookings" value={bookings.length} />
        <StatTile
          label="Pending review"
          value={bookings.filter((b) => b.status === "PENDING").length}
        />
        <StatTile
          label="Confirmed + completed value"
          value={formatCurrency(totalRevenue)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Most recent {bookings.length} bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No bookings yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">
                      {b.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{b.unit.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.unit.city}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{b.tenant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.tenant.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <p>{formatDateShort(b.checkIn)}</p>
                      <p className="text-xs text-muted-foreground">
                        to {formatDateShort(b.checkOut)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {formatCurrency(b.totalPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/bookings/${b.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
