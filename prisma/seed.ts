import { PrismaClient } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL_DOMAIN = "demo.kondohub.com";
const DEMO_PASSWORD = "demo123";

const amenities = [
  // General
  { name: "Air Conditioning", icon: "snowflake", category: "General" },
  { name: "WiFi", icon: "wifi", category: "General" },
  { name: "TV", icon: "tv", category: "General" },
  { name: "Balcony", icon: "door-open", category: "General" },
  { name: "Parking", icon: "car", category: "General" },
  { name: "Elevator", icon: "arrow-up", category: "General" },
  { name: "Pool Access", icon: "waves", category: "General" },
  { name: "Gym Access", icon: "dumbbell", category: "General" },

  // Kitchen
  { name: "Kitchen", icon: "utensils", category: "Kitchen" },
  { name: "Refrigerator", icon: "refrigerator", category: "Kitchen" },
  { name: "Microwave", icon: "microwave", category: "Kitchen" },
  { name: "Stove", icon: "flame", category: "Kitchen" },
  { name: "Coffee Maker", icon: "coffee", category: "Kitchen" },
  { name: "Dining Area", icon: "utensils-crossed", category: "Kitchen" },

  // Bedroom
  { name: "Wardrobe", icon: "shirt", category: "Bedroom" },
  { name: "Workspace", icon: "laptop", category: "Bedroom" },
  { name: "Iron", icon: "iron", category: "Bedroom" },
  { name: "Blackout Curtains", icon: "blinds", category: "Bedroom" },

  // Bathroom
  { name: "Hot Water", icon: "thermometer", category: "Bathroom" },
  { name: "Toiletries", icon: "bath", category: "Bathroom" },
  { name: "Hair Dryer", icon: "wind", category: "Bathroom" },
  { name: "Washing Machine", icon: "washing-machine", category: "Bathroom" },

  // Safety
  { name: "CCTV", icon: "camera", category: "Safety" },
  { name: "24/7 Security", icon: "shield", category: "Safety" },
  { name: "Fire Extinguisher", icon: "flame-kindling", category: "Safety" },
  { name: "First Aid Kit", icon: "briefcase-medical", category: "Safety" },
  { name: "Smoke Detector", icon: "alarm-smoke", category: "Safety" },
];

async function upsertCredentialUser(opts: {
  email: string;
  name: string;
  role: "ADMIN" | "OWNER" | "TENANT";
  phone?: string;
  password: string;
}) {
  const hashed = await hashPassword(opts.password);
  const user = await prisma.user.upsert({
    where: { email: opts.email },
    update: { name: opts.name, role: opts.role, phone: opts.phone, emailVerified: true },
    create: {
      email: opts.email,
      name: opts.name,
      role: opts.role,
      phone: opts.phone,
      emailVerified: true,
    },
  });
  await prisma.account.deleteMany({
    where: { userId: user.id, providerId: "credential" },
  });
  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: hashed,
    },
  });
  return user;
}

// Wipe demo data in FK-safe order so the seed can be re-run cleanly.
async function wipeDemoData() {
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: `@${DEMO_EMAIL_DOMAIN}` } },
    select: { id: true },
  });
  if (demoUsers.length === 0) return;
  const userIds = demoUsers.map((u) => u.id);

  const demoUnits = await prisma.unit.findMany({
    where: { ownerId: { in: userIds } },
    select: { id: true },
  });
  const unitIds = demoUnits.map((u) => u.id);

  await prisma.review.deleteMany({
    where: { OR: [{ tenantId: { in: userIds } }, { unitId: { in: unitIds } }] },
  });
  await prisma.booking.deleteMany({
    where: { OR: [{ tenantId: { in: userIds } }, { unitId: { in: unitIds } }] },
  });
  // Unit cascade handles photos, amenity links, availability, sales*.
  await prisma.unit.deleteMany({ where: { id: { in: unitIds } } });
  await prisma.account.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

async function main() {
  console.log("Seeding database...");

  // Amenities
  console.log("Creating amenities...");
  for (const amenity of amenities) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: {},
      create: amenity,
    });
  }
  console.log(`Created ${amenities.length} amenities`);

  // Admin
  console.log("Creating admin user...");
  const adminUser = await upsertCredentialUser({
    email: "admin@kondohub.com",
    name: "Admin User",
    role: "ADMIN",
    password: "admin123",
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // Wipe + reseed demo data
  console.log("Wiping previous demo data...");
  await wipeDemoData();

  // Owners
  console.log("Creating demo owners...");
  const maria = await upsertCredentialUser({
    email: `maria.santos@${DEMO_EMAIL_DOMAIN}`,
    name: "Maria Santos",
    role: "OWNER",
    phone: "+639171234567",
    password: DEMO_PASSWORD,
  });
  const juan = await upsertCredentialUser({
    email: `juan.delacruz@${DEMO_EMAIL_DOMAIN}`,
    name: "Juan Dela Cruz",
    role: "OWNER",
    phone: "+639172345678",
    password: DEMO_PASSWORD,
  });
  const ana = await upsertCredentialUser({
    email: `ana.reyes@${DEMO_EMAIL_DOMAIN}`,
    name: "Ana Reyes",
    role: "OWNER",
    phone: "+639173456789",
    password: DEMO_PASSWORD,
  });

  // Tenants
  console.log("Creating demo tenants...");
  const tenants = await Promise.all(
    [
      { first: "Carlo", last: "Mendoza" },
      { first: "Bea", last: "Aquino" },
      { first: "Miguel", last: "Tan" },
      { first: "Sofia", last: "Garcia" },
    ].map((t, i) =>
      upsertCredentialUser({
        email: `${t.first.toLowerCase()}.${t.last.toLowerCase()}@${DEMO_EMAIL_DOMAIN}`,
        name: `${t.first} ${t.last}`,
        role: "TENANT",
        phone: `+63917000${String(1000 + i).padStart(4, "0")}`,
        password: DEMO_PASSWORD,
      }),
    ),
  );
  const [carlo, bea, miguel, sofia] = tenants;

  // Lookup amenity ids by name for amenity links
  const amenityRows = await prisma.amenity.findMany();
  const amenityByName = new Map(amenityRows.map((a) => [a.name, a.id]));
  const pickAmenities = (names: string[]) =>
    names
      .map((n) => amenityByName.get(n))
      .filter((id): id is string => Boolean(id))
      .map((amenityId) => ({ amenityId }));

  // Photo URLs (Unsplash placeholders)
  const photoSets = [
    [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    ],
    [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb",
    ],
    [
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    ],
    [
      "https://images.unsplash.com/photo-1522444690501-d3b3d4f3b1e2",
      "https://images.unsplash.com/photo-1567552856336-fbb1c5b2c473",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    ],
    [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
    ],
  ];

  // Units
  console.log("Creating demo units...");
  const unitsSpec = [
    {
      ownerId: maria.id,
      slug: "bgc-skyline-loft",
      name: "BGC Skyline Loft",
      description:
        "Modern 1BR loft with panoramic skyline views, walking distance to High Street.",
      address: "8 Forbestown Road, Burgos Circle",
      city: "Taguig",
      province: "Metro Manila",
      zipCode: "1634",
      latitude: 14.5547,
      longitude: 121.0494,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      squareMeters: 38,
      floor: 24,
      dailyRate: 3500,
      weeklyRate: 21000,
      monthlyRate: 75000,
      status: "ACTIVE" as const,
      amenityNames: [
        "Air Conditioning",
        "WiFi",
        "TV",
        "Pool Access",
        "Gym Access",
        "Kitchen",
        "Refrigerator",
        "Workspace",
        "24/7 Security",
      ],
      photos: photoSets[0],
    },
    {
      ownerId: maria.id,
      slug: "makati-business-suite",
      name: "Makati Business Suite",
      description: "Executive studio steps from Ayala Avenue. Ideal for business travelers.",
      address: "Salcedo Village",
      city: "Makati",
      province: "Metro Manila",
      zipCode: "1227",
      latitude: 14.5592,
      longitude: 121.0244,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      squareMeters: 32,
      floor: 18,
      dailyRate: 3000,
      weeklyRate: 18000,
      monthlyRate: 65000,
      status: "ACTIVE" as const,
      amenityNames: [
        "Air Conditioning",
        "WiFi",
        "TV",
        "Elevator",
        "Kitchen",
        "Coffee Maker",
        "Workspace",
        "CCTV",
      ],
      photos: photoSets[1],
    },
    {
      ownerId: juan.id,
      slug: "cebu-it-park-condo",
      name: "Cebu IT Park Condo",
      description: "Cozy 2BR with full kitchen, two minutes from Ayala Center Cebu.",
      address: "Apas, Lahug",
      city: "Cebu City",
      province: "Cebu",
      zipCode: "6000",
      latitude: 10.3299,
      longitude: 123.9067,
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      squareMeters: 55,
      floor: 12,
      dailyRate: 2800,
      weeklyRate: 17000,
      monthlyRate: 55000,
      status: "ACTIVE" as const,
      amenityNames: [
        "Air Conditioning",
        "WiFi",
        "TV",
        "Parking",
        "Pool Access",
        "Kitchen",
        "Refrigerator",
        "Microwave",
        "Stove",
        "Washing Machine",
      ],
      photos: photoSets[2],
    },
    {
      ownerId: juan.id,
      slug: "tagaytay-ridge-retreat",
      name: "Tagaytay Ridge Retreat",
      description: "Family-friendly 3BR home with Taal view, fireplace, and large garden.",
      address: "Calamba Road",
      city: "Tagaytay",
      province: "Cavite",
      zipCode: "4120",
      latitude: 14.0974,
      longitude: 120.9645,
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 8,
      squareMeters: 140,
      floor: 1,
      dailyRate: 6500,
      weeklyRate: 39000,
      monthlyRate: 140000,
      status: "ACTIVE" as const,
      amenityNames: [
        "WiFi",
        "TV",
        "Parking",
        "Kitchen",
        "Refrigerator",
        "Stove",
        "Dining Area",
        "Hot Water",
        "Smoke Detector",
        "First Aid Kit",
      ],
      photos: photoSets[3],
    },
    {
      ownerId: ana.id,
      slug: "boracay-station-2-villa",
      name: "Boracay Station 2 Villa",
      description: "Beachfront villa, 2 minutes' walk to D'Mall and White Beach.",
      address: "Station 2, White Beach",
      city: "Malay",
      province: "Aklan",
      zipCode: "5608",
      latitude: 11.9674,
      longitude: 121.9248,
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 5,
      squareMeters: 80,
      floor: 2,
      dailyRate: 7500,
      weeklyRate: 45000,
      monthlyRate: 160000,
      status: "ACTIVE" as const,
      amenityNames: [
        "Air Conditioning",
        "WiFi",
        "TV",
        "Pool Access",
        "Kitchen",
        "Refrigerator",
        "Hot Water",
        "Hair Dryer",
        "24/7 Security",
      ],
      photos: photoSets[4],
    },
    {
      ownerId: ana.id,
      slug: "qc-katipunan-studio",
      name: "QC Katipunan Studio",
      description: "Affordable studio near Ateneo and UP. Perfect for students or interns.",
      address: "Katipunan Avenue",
      city: "Quezon City",
      province: "Metro Manila",
      zipCode: "1108",
      latitude: 14.6378,
      longitude: 121.0773,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      squareMeters: 24,
      floor: 7,
      dailyRate: 1800,
      weeklyRate: 11000,
      monthlyRate: 35000,
      status: "DRAFT" as const,
      amenityNames: ["Air Conditioning", "WiFi", "TV", "Workspace", "Elevator"],
      photos: photoSets[0],
    },
  ];

  const createdUnits: Record<string, string> = {};
  for (const u of unitsSpec) {
    const unit = await prisma.unit.create({
      data: {
        ownerId: u.ownerId,
        slug: u.slug,
        name: u.name,
        description: u.description,
        address: u.address,
        city: u.city,
        province: u.province,
        zipCode: u.zipCode,
        latitude: u.latitude,
        longitude: u.longitude,
        bedrooms: u.bedrooms,
        bathrooms: u.bathrooms,
        maxGuests: u.maxGuests,
        squareMeters: u.squareMeters,
        floor: u.floor,
        dailyRate: u.dailyRate,
        weeklyRate: u.weeklyRate,
        monthlyRate: u.monthlyRate,
        status: u.status,
        photos: {
          create: u.photos.map((url, idx) => ({
            url,
            key: `${u.slug}/photo-${idx + 1}.jpg`,
            isPrimary: idx === 0,
            order: idx,
          })),
        },
        amenities: { create: pickAmenities(u.amenityNames) },
      },
    });
    createdUnits[u.slug] = unit.id;
  }
  console.log(`Created ${unitsSpec.length} units`);

  // Availability — block a few near-term dates per unit
  console.log("Creating availability blocks...");
  const blockedDates = ["2026-05-15", "2026-05-16", "2026-05-17", "2026-06-10", "2026-06-11"];
  for (const unitId of Object.values(createdUnits)) {
    await prisma.availability.createMany({
      data: blockedDates.map((d) => ({
        unitId,
        date: day(d),
        available: false,
      })),
    });
  }

  // Bookings — mix of statuses across tenants. Today = 2026-04-30.
  console.log("Creating bookings + reviews...");
  type BookingSpec = {
    unitSlug: string;
    tenantId: string;
    checkIn: string;
    checkOut: string;
    durationType: "DAILY" | "WEEKLY" | "MONTHLY";
    guests: number;
    nights: number;
    rate: number;
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";
    review?: { rating: number; comment: string };
    tenantNotes?: string;
    ownerNotes?: string;
  };
  const bookingSpecs: BookingSpec[] = [
    {
      unitSlug: "bgc-skyline-loft",
      tenantId: carlo.id,
      checkIn: "2026-03-05",
      checkOut: "2026-03-08",
      durationType: "DAILY",
      guests: 2,
      nights: 3,
      rate: 3500,
      status: "COMPLETED",
      review: { rating: 5, comment: "Spotless, great view, host was very responsive." },
    },
    {
      unitSlug: "makati-business-suite",
      tenantId: bea.id,
      checkIn: "2026-03-18",
      checkOut: "2026-03-22",
      durationType: "DAILY",
      guests: 1,
      nights: 4,
      rate: 3000,
      status: "COMPLETED",
      review: { rating: 4, comment: "Convenient location for work meetings. Wifi was fast." },
    },
    {
      unitSlug: "cebu-it-park-condo",
      tenantId: miguel.id,
      checkIn: "2026-04-02",
      checkOut: "2026-04-09",
      durationType: "WEEKLY",
      guests: 3,
      nights: 7,
      rate: 17000 / 7,
      status: "COMPLETED",
      review: { rating: 5, comment: "Family loved the pool. Will rebook." },
    },
    {
      unitSlug: "tagaytay-ridge-retreat",
      tenantId: sofia.id,
      checkIn: "2026-05-08",
      checkOut: "2026-05-11",
      durationType: "DAILY",
      guests: 6,
      nights: 3,
      rate: 6500,
      status: "CONFIRMED",
      tenantNotes: "Arriving around 4pm, family of 6.",
    },
    {
      unitSlug: "boracay-station-2-villa",
      tenantId: carlo.id,
      checkIn: "2026-05-20",
      checkOut: "2026-05-25",
      durationType: "DAILY",
      guests: 4,
      nights: 5,
      rate: 7500,
      status: "CONFIRMED",
    },
    {
      unitSlug: "bgc-skyline-loft",
      tenantId: bea.id,
      checkIn: "2026-06-01",
      checkOut: "2026-06-04",
      durationType: "DAILY",
      guests: 2,
      nights: 3,
      rate: 3500,
      status: "PENDING",
      tenantNotes: "Quiet trip, no parties.",
    },
    {
      unitSlug: "cebu-it-park-condo",
      tenantId: sofia.id,
      checkIn: "2026-06-15",
      checkOut: "2026-07-15",
      durationType: "MONTHLY",
      guests: 2,
      nights: 30,
      rate: 55000 / 30,
      status: "PENDING",
    },
    {
      unitSlug: "makati-business-suite",
      tenantId: miguel.id,
      checkIn: "2026-04-15",
      checkOut: "2026-04-18",
      durationType: "DAILY",
      guests: 1,
      nights: 3,
      rate: 3000,
      status: "CANCELLED",
      ownerNotes: "Tenant cancelled 5 days before check-in.",
    },
    {
      unitSlug: "tagaytay-ridge-retreat",
      tenantId: bea.id,
      checkIn: "2026-04-22",
      checkOut: "2026-04-24",
      durationType: "DAILY",
      guests: 8,
      nights: 2,
      rate: 6500,
      status: "REJECTED",
      ownerNotes: "Booking exceeded guest limit policy for short stays.",
    },
  ];

  for (const b of bookingSpecs) {
    const basePrice = Number((b.nights * b.rate).toFixed(2));
    const serviceFee = Number((basePrice * 0.05).toFixed(2));
    const totalPrice = Number((basePrice + serviceFee).toFixed(2));
    const booking = await prisma.booking.create({
      data: {
        unitId: createdUnits[b.unitSlug],
        tenantId: b.tenantId,
        checkIn: day(b.checkIn),
        checkOut: day(b.checkOut),
        durationType: b.durationType,
        guests: b.guests,
        basePrice,
        serviceFee,
        totalPrice,
        status: b.status,
        tenantNotes: b.tenantNotes,
        ownerNotes: b.ownerNotes,
      },
    });
    if (b.review && b.status === "COMPLETED") {
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          unitId: createdUnits[b.unitSlug],
          tenantId: b.tenantId,
          rating: b.review.rating,
          comment: b.review.comment,
        },
      });
    }
  }
  console.log(`Created ${bookingSpecs.length} bookings`);

  // Sales targets — current and previous month for each active unit
  console.log("Creating sales targets + entries...");
  for (const [slug, unitId] of Object.entries(createdUnits)) {
    const spec = unitsSpec.find((u) => u.slug === slug)!;
    if (spec.status !== "ACTIVE" || !spec.dailyRate) continue;
    for (const { year, month } of [
      { year: 2026, month: 3 },
      { year: 2026, month: 4 },
    ]) {
      await prisma.salesTarget.upsert({
        where: { unitId_year_month: { unitId, year, month } },
        update: { dailyTargetRate: spec.dailyRate, notes: "Auto-generated demo target" },
        create: {
          unitId,
          year,
          month,
          dailyTargetRate: spec.dailyRate,
          notes: "Auto-generated demo target",
        },
      });
    }

    // A handful of daily sales entries across April 2026
    const entries: { date: string; platform: "KONDOHUB" | "AIRBNB" | "FACEBOOK" | "DIRECT"; bookings: number; revenue: number; remarks?: string }[] = [
      { date: "2026-04-03", platform: "KONDOHUB", bookings: 1, revenue: spec.dailyRate },
      { date: "2026-04-10", platform: "AIRBNB", bookings: 1, revenue: spec.dailyRate * 1.1, remarks: "Weekend premium" },
      { date: "2026-04-17", platform: "FACEBOOK", bookings: 1, revenue: spec.dailyRate * 0.9, remarks: "Repeat guest discount" },
      { date: "2026-04-24", platform: "DIRECT", bookings: 1, revenue: spec.dailyRate },
    ];
    for (const e of entries) {
      await prisma.salesEntry.upsert({
        where: { unitId_date: { unitId, date: day(e.date) } },
        update: {
          platform: e.platform,
          bookings: e.bookings,
          revenue: Number(e.revenue.toFixed(2)),
          remarks: e.remarks,
        },
        create: {
          unitId,
          date: day(e.date),
          platform: e.platform,
          bookings: e.bookings,
          revenue: Number(e.revenue.toFixed(2)),
          remarks: e.remarks,
        },
      });
    }
  }

  console.log("Seeding complete!");
  console.log("\nDemo credentials:");
  console.log("  admin@kondohub.com / admin123");
  console.log(`  All demo owners + tenants share password: ${DEMO_PASSWORD}`);
  console.log(`    maria.santos@${DEMO_EMAIL_DOMAIN}    (OWNER)`);
  console.log(`    juan.delacruz@${DEMO_EMAIL_DOMAIN}   (OWNER)`);
  console.log(`    ana.reyes@${DEMO_EMAIL_DOMAIN}       (OWNER)`);
  console.log(`    carlo.mendoza@${DEMO_EMAIL_DOMAIN}   (TENANT)`);
  console.log(`    bea.aquino@${DEMO_EMAIL_DOMAIN}      (TENANT)`);
  console.log(`    miguel.tan@${DEMO_EMAIL_DOMAIN}      (TENANT)`);
  console.log(`    sofia.garcia@${DEMO_EMAIL_DOMAIN}    (TENANT)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
