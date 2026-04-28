import { PrismaClient } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

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

async function main() {
  console.log("Seeding database...");

  // Create amenities
  console.log("Creating amenities...");
  for (const amenity of amenities) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: {},
      create: amenity,
    });
  }
  console.log(`Created ${amenities.length} amenities`);

  // Create admin user
  console.log("Creating admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@kondohub.com" },
    update: {},
    create: {
      email: "admin@kondohub.com",
      name: "Admin User",
      role: "ADMIN",
      emailVerified: true,
      accounts: {
        create: {
          accountId: "admin-account",
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
