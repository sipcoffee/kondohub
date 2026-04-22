# KondoHub - Condo Booking Platform MVP Plan

## Overview
A booking platform for condo unit stays with three user roles: Admin, Owner, and Tenant. Owners can list multiple condo units with flexible pricing (daily, weekly, monthly), while tenants can search and book units for staycation or long-term stays.

---

## Tech Stack (Based on Kodayak)

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL + Prisma ORM 7.x |
| **Authentication** | better-auth (email/password + Google OAuth) |
| **UI Components** | shadcn/ui + Radix UI + Tailwind CSS 4 |
| **Forms** | React Hook Form + Zod validation |
| **Data Fetching** | SWR (client) + Server Components (server) |
| **File Storage** | Cloudflare R2 (S3-compatible) |
| **Icons** | Lucide React |
| **Notifications** | Sonner (toast) |

---

## User Roles & Permissions

### 1. Admin
- Manage all users (owners & tenants)
- Approve/reject owner registrations
- View all bookings and units
- Access analytics dashboard
- Manage platform settings

### 2. Owner
- Create and manage multiple condo units
- Set pricing: daily, weekly, monthly rates
- Upload unit photos
- Set availability calendar
- View and manage bookings for their units
- Accept/reject booking requests
- View earnings dashboard

### 3. Tenant
- Browse available condo units
- Filter by location, price, duration, amenities
- View unit details and photos
- Make booking requests
- View booking history
- Leave reviews after stay

---

## Database Schema

### Core Models

```prisma
enum Role {
  ADMIN
  OWNER
  TENANT
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  REJECTED
}

enum UnitStatus {
  DRAFT
  ACTIVE
  INACTIVE
  UNDER_MAINTENANCE
}

enum DurationType {
  DAILY
  WEEKLY
  MONTHLY
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  phone         String?
  role          Role      @default(TENANT)
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  sessions      Session[]
  accounts      Account[]
  units         Unit[]        @relation("OwnerUnits")
  bookings      Booking[]     @relation("TenantBookings")
  reviews       Review[]
}

model Unit {
  id            String      @id @default(cuid())
  ownerId       String
  owner         User        @relation("OwnerUnits", fields: [ownerId], references: [id])

  // Basic Info
  name          String
  description   String
  address       String
  city          String
  province      String
  zipCode       String?
  latitude      Float?
  longitude     Float?

  // Unit Details
  bedrooms      Int
  bathrooms     Int
  maxGuests     Int
  squareMeters  Float?
  floor         Int?

  // Pricing
  dailyRate     Float?
  weeklyRate    Float?
  monthlyRate   Float?

  // Status
  status        UnitStatus  @default(DRAFT)

  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relations
  photos        UnitPhoto[]
  amenities     UnitAmenity[]
  bookings      Booking[]
  reviews       Review[]
  availability  Availability[]
}

model UnitPhoto {
  id        String   @id @default(cuid())
  unitId    String
  unit      Unit     @relation(fields: [unitId], references: [id], onDelete: Cascade)
  url       String
  isPrimary Boolean  @default(false)
  order     Int      @default(0)
  createdAt DateTime @default(now())
}

model Amenity {
  id        String        @id @default(cuid())
  name      String        @unique
  icon      String?
  category  String?       // e.g., "General", "Kitchen", "Safety"
  units     UnitAmenity[]
}

model UnitAmenity {
  unitId    String
  amenityId String
  unit      Unit    @relation(fields: [unitId], references: [id], onDelete: Cascade)
  amenity   Amenity @relation(fields: [amenityId], references: [id])

  @@id([unitId, amenityId])
}

model Availability {
  id        String   @id @default(cuid())
  unitId    String
  unit      Unit     @relation(fields: [unitId], references: [id], onDelete: Cascade)
  date      DateTime
  available Boolean  @default(true)
  price     Float?   // Override price for specific date

  @@unique([unitId, date])
}

model Booking {
  id            String        @id @default(cuid())
  unitId        String
  unit          Unit          @relation(fields: [unitId], references: [id])
  tenantId      String
  tenant        User          @relation("TenantBookings", fields: [tenantId], references: [id])

  // Booking Details
  checkIn       DateTime
  checkOut      DateTime
  durationType  DurationType
  guests        Int

  // Pricing
  basePrice     Float
  serviceFee    Float         @default(0)
  totalPrice    Float

  // Status
  status        BookingStatus @default(PENDING)

  // Notes
  tenantNotes   String?
  ownerNotes    String?

  // Timestamps
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  review        Review?
}

model Review {
  id          String   @id @default(cuid())
  bookingId   String   @unique
  booking     Booking  @relation(fields: [bookingId], references: [id])
  unitId      String
  unit        Unit     @relation(fields: [unitId], references: [id])
  tenantId    String
  tenant      User     @relation(fields: [tenantId], references: [id])

  rating      Int      // 1-5
  comment     String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Application Routes

### Public Routes
```
/                       # Landing page
/units                  # Browse all units
/units/[id]             # Unit detail page
/login                  # Login page
/signup                 # Registration (select role: Owner or Tenant)
/about                  # About page
/contact                # Contact page
```

### Tenant Routes (Protected)
```
/dashboard              # Tenant dashboard
/bookings               # My bookings list
/bookings/[id]          # Booking detail
/favorites              # Saved units
/settings               # Account settings
```

### Owner Routes (Protected)
```
/owner/dashboard        # Owner dashboard with stats
/owner/units            # My units list
/owner/units/new        # Create new unit
/owner/units/[id]       # Edit unit
/owner/units/[id]/photos    # Manage unit photos
/owner/units/[id]/calendar  # Availability calendar
/owner/bookings         # Incoming bookings
/owner/earnings         # Earnings report
/owner/settings         # Owner settings
```

### Admin Routes (Protected)
```
/admin/dashboard        # Admin overview
/admin/users            # User management
/admin/units            # All units management
/admin/bookings         # All bookings
/admin/analytics        # Platform analytics
/admin/settings         # Platform settings
```

---

## API Endpoints

### Authentication
```
POST /api/auth/[...all]     # better-auth handler
```

### Units
```
GET    /api/units           # List units (with filters)
GET    /api/units/[id]      # Get unit details
POST   /api/units           # Create unit (owner)
PATCH  /api/units/[id]      # Update unit (owner)
DELETE /api/units/[id]      # Delete unit (owner)
POST   /api/units/[id]/photos   # Upload photos
DELETE /api/units/[id]/photos/[photoId]  # Delete photo
```

### Availability
```
GET    /api/units/[id]/availability     # Get availability
POST   /api/units/[id]/availability     # Set availability
```

### Bookings
```
GET    /api/bookings            # List bookings
GET    /api/bookings/[id]       # Get booking detail
POST   /api/bookings            # Create booking (tenant)
PATCH  /api/bookings/[id]       # Update booking status
DELETE /api/bookings/[id]       # Cancel booking
```

### Reviews
```
GET    /api/units/[id]/reviews  # Get unit reviews
POST   /api/bookings/[id]/review # Create review
```

### Admin
```
GET    /api/admin/users         # List all users
PATCH  /api/admin/users/[id]    # Update user
GET    /api/admin/analytics     # Get analytics
```

---

## Key Features (MVP Scope)

### Phase 1: Core Foundation
- [ ] Project setup with Next.js 16 + TypeScript
- [ ] Database schema and Prisma setup
- [ ] Authentication with better-auth (3 roles)
- [ ] Basic UI components (shadcn/ui)
- [ ] Protected route middleware

### Phase 2: Owner Features
- [ ] Unit CRUD operations
- [ ] Photo upload to R2
- [ ] Pricing configuration (daily/weekly/monthly)
- [ ] Availability calendar
- [ ] Owner dashboard

### Phase 3: Tenant Features
- [ ] Unit browsing with filters
- [ ] Unit detail page with gallery
- [ ] Booking request flow
- [ ] Booking history
- [ ] Review system

### Phase 4: Admin Features
- [ ] User management
- [ ] Unit moderation
- [ ] Booking overview
- [ ] Basic analytics

### Phase 5: Polish & Launch
- [ ] Email notifications
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Error handling & loading states

---

## UI Components Needed

### Shared
- `Navbar` - Navigation with role-based menu
- `Footer` - Site footer
- `UnitCard` - Unit preview card for listings
- `BookingCard` - Booking summary card
- `ReviewCard` - Review display
- `DateRangePicker` - Check-in/out selection
- `PriceDisplay` - Price with duration toggle
- `StatusBadge` - Booking/unit status indicator
- `ImageGallery` - Unit photo gallery
- `LoadingSkeleton` - Loading states

### Forms
- `LoginForm` - Email/password + OAuth
- `SignupForm` - Registration with role selection
- `UnitForm` - Create/edit unit
- `BookingForm` - Create booking
- `ReviewForm` - Submit review
- `FilterForm` - Unit search filters

### Dashboards
- `StatsCard` - Metric display card
- `BookingTable` - Bookings data table
- `UnitTable` - Units data table
- `UserTable` - Users data table (admin)
- `EarningsChart` - Revenue visualization

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Storage (R2)
R2_ENDPOINT=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=KondoHub
```

---

## Directory Structure

```
kondohub/
├── app/
│   ├── (admin)/
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── users/
│   │       ├── units/
│   │       └── bookings/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── bookings/
│   │   ├── favorites/
│   │   └── settings/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (marketing)/
│   │   ├── page.tsx (landing)
│   │   ├── about/
│   │   └── contact/
│   ├── (owner)/
│   │   └── owner/
│   │       ├── dashboard/
│   │       ├── units/
│   │       ├── bookings/
│   │       └── earnings/
│   ├── api/
│   │   ├── auth/[...all]/
│   │   ├── units/
│   │   ├── bookings/
│   │   └── admin/
│   └── units/
│       ├── page.tsx (browse)
│       └── [id]/
├── components/
│   ├── ui/           # shadcn/ui
│   ├── forms/
│   ├── cards/
│   ├── tables/
│   └── layout/
├── hooks/
├── lib/
│   ├── auth.ts
│   ├── auth-client.ts
│   ├── prisma.ts
│   ├── r2.ts
│   ├── swr.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── types/
```

---

## Estimated MVP Scope

### Must Have (MVP)
- User registration & login (3 roles)
- Owner: Create units with photos & pricing
- Tenant: Browse & book units
- Basic booking flow (request → confirm/reject)
- Owner/Tenant dashboards

### Nice to Have (Post-MVP)
- Payment integration
- Real-time notifications
- Chat between owner & tenant
- Advanced search with map
- Mobile app (PWA)
- Multi-language support

---

## Next Steps

1. **Initialize project** with Next.js 16 + TypeScript
2. **Setup Prisma** with PostgreSQL and create schema
3. **Configure better-auth** with role-based access
4. **Build authentication pages** (login, signup)
5. **Create middleware** for route protection
6. **Build owner unit management** (CRUD + photos)
7. **Build tenant browsing** (list, filter, detail)
8. **Implement booking flow**
9. **Build dashboards** for each role
10. **Testing & polish**
