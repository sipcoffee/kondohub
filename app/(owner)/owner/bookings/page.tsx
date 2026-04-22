import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CalendarDays, Building2, User } from "lucide-react";

export const metadata = {
  title: "Manage Bookings",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

export default async function OwnerBookingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      unit: {
        ownerId: session.user.id,
      },
    },
    include: {
      unit: {
        include: {
          photos: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
      tenant: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const otherBookings = bookings.filter(
    (b) => !["PENDING", "CONFIRMED"].includes(b.status)
  );

  const BookingRow = ({
    booking,
    showActions = false,
  }: {
    booking: (typeof bookings)[0];
    showActions?: boolean;
  }) => (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted">
            {booking.unit.photos[0] ? (
              <Image
                src={booking.unit.photos[0].url}
                alt={booking.unit.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <span className="font-medium">{booking.unit.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{booking.tenant.name}</p>
            <p className="text-sm text-muted-foreground">{booking.tenant.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <p>{formatDateShort(booking.checkIn)}</p>
          <p className="text-muted-foreground">to {formatDateShort(booking.checkOut)}</p>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm">{booking.guests}</span>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <p className="font-medium">{formatCurrency(booking.totalPrice)}</p>
          <p className="text-muted-foreground capitalize">
            {booking.durationType.toLowerCase()}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
      </TableCell>
      <TableCell>
        {showActions ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/owner/bookings/${booking.id}`}>View</Link>
            </Button>
            {booking.status === "PENDING" && (
              <>
                <Button size="sm">Confirm</Button>
                <Button size="sm" variant="destructive">
                  Reject
                </Button>
              </>
            )}
          </div>
        ) : (
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/owner/bookings/${booking.id}`}>View</Link>
          </Button>
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Manage Bookings</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage booking requests for your units
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({otherBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingBookings.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  Review and respond to booking requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingBookings.map((booking) => (
                      <BookingRow
                        key={booking.id}
                        booking={booking}
                        showActions
                      />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">
                  No pending requests
                </h2>
                <p className="text-muted-foreground">
                  New booking requests will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          {confirmedBookings.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Confirmed Bookings</CardTitle>
                <CardDescription>
                  Active and upcoming confirmed stays
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirmedBookings.map((booking) => (
                      <BookingRow key={booking.id} booking={booking} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">
                  No confirmed bookings
                </h2>
                <p className="text-muted-foreground">
                  Confirmed bookings will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {otherBookings.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>
                  Completed, cancelled, and rejected bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherBookings.map((booking) => (
                      <BookingRow key={booking.id} booking={booking} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">No booking history</h2>
                <p className="text-muted-foreground">
                  Past bookings will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
