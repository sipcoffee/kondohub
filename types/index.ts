import type {
  User,
  Unit,
  Booking,
  Review,
  UnitPhoto,
  Amenity,
} from "@/lib/generated/prisma";

// Extended types with relations
export type UnitWithRelations = Unit & {
  owner: Pick<User, "id" | "name" | "email" | "image">;
  photos: UnitPhoto[];
  amenities: { amenity: Amenity }[];
  reviews: (Review & { tenant: Pick<User, "id" | "name" | "image"> })[];
  _count?: {
    bookings: number;
    reviews: number;
  };
};

export type BookingWithRelations = Booking & {
  unit: Unit & {
    photos: UnitPhoto[];
    owner: Pick<User, "id" | "name" | "email">;
  };
  tenant: Pick<User, "id" | "name" | "email" | "phone">;
  review?: Review | null;
};

export type ReviewWithRelations = Review & {
  tenant: Pick<User, "id" | "name" | "image">;
  unit: Pick<Unit, "id" | "name" | "slug">;
};

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Filter types
export type UnitFilters = {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  guests?: number;
  durationType?: "DAILY" | "WEEKLY" | "MONTHLY";
  amenities?: string[];
};

// Stats types
export type OwnerStats = {
  totalUnits: number;
  activeUnits: number;
  totalBookings: number;
  pendingBookings: number;
  totalEarnings: number;
  monthlyEarnings: number;
};

export type AdminStats = {
  totalUsers: number;
  totalOwners: number;
  totalTenants: number;
  totalUnits: number;
  totalBookings: number;
  recentBookings: BookingWithRelations[];
};

export type TenantStats = {
  totalBookings: number;
  upcomingBookings: number;
  completedStays: number;
  totalSpent: number;
};
