import Link from "next/link";
import Image from "next/image";
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
import { Building2, Eye, Pencil } from "lucide-react";

export const metadata = { title: "All units" };

export default async function AdminUnitsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") redirect("/dashboard");

  const units = await prisma.unit.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      photos: { where: { isPrimary: true }, take: 1 },
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { bookings: true, reviews: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">All units</h1>
        <p className="text-muted-foreground mt-1">
          Every condo on the platform across all owners.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{units.length} units</CardTitle>
          <CardDescription>Sorted by most recently created.</CardDescription>
        </CardHeader>
        <CardContent>
          {units.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No units yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Reviews</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((u) => {
                  const lowest = Math.min(
                    ...[u.dailyRate, u.weeklyRate, u.monthlyRate].filter(
                      (r): r is number => r !== null
                    ),
                  );
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
                            {u.photos[0] ? (
                              <Image
                                src={u.photos[0].url}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {u.city}, {u.province}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{u.owner.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.owner.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={u.status} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {Number.isFinite(lowest) ? formatCurrency(lowest) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {u._count.bookings}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {u._count.reviews}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateShort(u.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {u.status === "ACTIVE" && (
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/units/${u.slug}`} aria-label="View">
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" asChild>
                            <Link
                              href={`/owner/units/${u.id}`}
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
