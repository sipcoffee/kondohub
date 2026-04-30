import Link from "next/link";
import {
  Search,
  Calendar,
  Star,
  Heart,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  Waves,
  Dumbbell,
  Wifi,
  Car,
  TrendingUp,
  Award,
} from "lucide-react";

/* ————————————————————————————————————————————————————————
   DATA
   ———————————————————————————————————————————————————————— */

const categories = [
  { label: "All stays", active: true },
  { label: "Studios" },
  { label: "1 Bedroom" },
  { label: "2 Bedroom" },
  { label: "Penthouse" },
  { label: "Pool view" },
  { label: "Sea view" },
  { label: "Pet friendly" },
  { label: "Family" },
  { label: "Long stay" },
  { label: "Pro work" },
];

const featured = [
  {
    id: 1,
    title: "Skyline Studio at The Gramercy",
    building: "The Gramercy Residences · 60F",
    locality: "Makati · Legazpi Village",
    nightly: 2500,
    monthly: 54000,
    rating: 4.98,
    reviews: 142,
    badge: "Guest favorite",
    amenities: ["pool", "gym", "wifi"],
    // soft tonal canvas
    bg: "from-[#FDE8E4] via-[#FBD9D2] to-[#F4C0B5]",
    accent: "bg-[#C13947]",
  },
  {
    id: 2,
    title: "Reading Loft in BGC",
    building: "Uptown Parc Residences · 18F",
    locality: "Taguig · BGC",
    nightly: 3800,
    monthly: 82000,
    rating: 4.92,
    reviews: 89,
    badge: "New",
    amenities: ["pool", "parking", "wifi"],
    bg: "from-[#E4EEF5] via-[#CFDDEC] to-[#AAC4DA]",
    accent: "bg-[#2C4A6B]",
  },
  {
    id: 3,
    title: "Ortigas Business Suite",
    building: "One Shangri-La Place · 34F",
    locality: "Pasig · San Antonio",
    nightly: 2200,
    monthly: 46000,
    rating: 4.87,
    reviews: 211,
    badge: "Superhost",
    amenities: ["gym", "wifi", "parking"],
    bg: "from-[#EAEAE2] via-[#D7D6C5] to-[#B3B29B]",
    accent: "bg-[#4B5040]",
  },
  {
    id: 4,
    title: "Sunset Penthouse, Manila Bay",
    building: "Admiral Hotel Residences · PH",
    locality: "Manila · Roxas Boulevard",
    nightly: 6800,
    monthly: 145000,
    rating: 5.0,
    reviews: 57,
    badge: "Luxury",
    amenities: ["pool", "gym", "wifi"],
    bg: "from-[#FFE8D1] via-[#FFCFA8] to-[#F29969]",
    accent: "bg-[#A13E1A]",
  },
  {
    id: 5,
    title: "Cebu Beachfront 1-BR",
    building: "Mactan Newtown · Tower 3",
    locality: "Cebu · Lapu-Lapu",
    nightly: 2900,
    monthly: 62000,
    rating: 4.94,
    reviews: 128,
    badge: "Near beach",
    amenities: ["pool", "wifi"],
    bg: "from-[#DFF0EE] via-[#BFE2DD] to-[#8FC9C2]",
    accent: "bg-[#1F5E58]",
  },
  {
    id: 6,
    title: "Pine-forest Studio, Baguio",
    building: "Brentwood · Session Road",
    locality: "Baguio · Upper Session",
    nightly: 1900,
    monthly: 42000,
    rating: 4.89,
    reviews: 96,
    badge: "Cool weather",
    amenities: ["wifi", "parking"],
    bg: "from-[#E7EBDC] via-[#CFD7B8] to-[#A5B386]",
    accent: "bg-[#3A4A2A]",
  },
  {
    id: 7,
    title: "Alabang Family 2-BR",
    building: "The Palm Tower",
    locality: "Muntinlupa · Alabang",
    nightly: 3400,
    monthly: 72000,
    rating: 4.91,
    reviews: 174,
    badge: "Family friendly",
    amenities: ["pool", "gym", "parking"],
    bg: "from-[#F7E9F1] via-[#EACFDE] to-[#D5A6BF]",
    accent: "bg-[#7A2E52]",
  },
  {
    id: 8,
    title: "Poblacion Loft · Makati",
    building: "Sanso Suites · 12F",
    locality: "Makati · Poblacion",
    nightly: 2700,
    monthly: 58000,
    rating: 4.85,
    reviews: 203,
    badge: "Nightlife",
    amenities: ["wifi", "gym"],
    bg: "from-[#F1E4F5] via-[#DFC7E9] to-[#B891CF]",
    accent: "bg-[#4A2D6A]",
  },
];

const destinations = [
  {
    city: "Metro Manila",
    blurb: "548 condos across Makati, BGC, Ortigas & Manila",
    bg: "from-[#E8ECF3] via-[#C3CEE0] to-[#7C93B6]",
    count: 342,
  },
  {
    city: "Cebu",
    blurb: "Beachfront towers and business-district pieds-à-terre",
    bg: "from-[#DFF0EE] via-[#9CCBC4] to-[#1F5E58]",
    count: 86,
  },
  {
    city: "Baguio",
    blurb: "Cool-weather studios in the pines",
    bg: "from-[#E7EBDC] via-[#B5C394] to-[#4F6239]",
    count: 42,
  },
  {
    city: "Boracay",
    blurb: "Island condos, a walk from White Beach",
    bg: "from-[#FFF1D6] via-[#F2CE8B] to-[#C78A3A]",
    count: 38,
  },
  {
    city: "Palawan",
    blurb: "Puerto Princesa & El Nido beachside units",
    bg: "from-[#DCEEF3] via-[#8EC9D5] to-[#2A7183]",
    count: 24,
  },
  {
    city: "Batangas",
    blurb: "Weekend condos by Nasugbu & Tagaytay",
    bg: "from-[#F7E5DD] via-[#E5B49D] to-[#9F5B3F]",
    count: 31,
  },
];

const reasons = [
  {
    icon: Shield,
    title: "Verified condos",
    body: "Every listing is personally inspected by our team — keys tested, aircon checked, pool actually filled.",
  },
  {
    icon: Calendar,
    title: "Stay your way",
    body: "Daily, weekly, or monthly rates. Book one night after a late flight or six months while a lease sorts itself out.",
  },
  {
    icon: Sparkles,
    title: "Honest pricing",
    body: "The total at checkout is the total you pay. No surprise association dues, no invented 'resort fees.'",
  },
  {
    icon: Clock,
    title: "Humans on call",
    body: "Our Manila-based team answers the phone 24/7 — through brownouts and typhoons. Real people, every time.",
  },
];

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Search",
    body: "Pick a city, dates, and the number of bedrooms. Filter by pool, parking, pet-friendly, or sea view.",
  },
  {
    n: "02",
    icon: Heart,
    title: "Shortlist",
    body: "Save the condos worth a second look. Compare floor plans, amenities, and monthly rates side by side.",
  },
  {
    n: "03",
    icon: Calendar,
    title: "Book",
    body: "Choose daily, weekly, or monthly. One payment, one confirmation, one keycode delivered by SMS.",
  },
  {
    n: "04",
    icon: Sparkles,
    title: "Arrive",
    body: "Self check-in at the lobby. A host on WhatsApp. Clean towels stacked, coffee already in the cupboard.",
  },
];

const testimonials = [
  {
    name: "Maria Santos",
    role: "Writer · Davao",
    avatar: "MS",
    rating: 5,
    content:
      "Booked a one-bedroom in BGC sight unseen for a month. It looked exactly like the photos — a rarity on these apps.",
    avatarBg: "bg-[#FDE8E4]",
    avatarFg: "text-[#C13947]",
  },
  {
    name: "James Chen",
    role: "Product designer",
    avatar: "JC",
    rating: 5,
    content:
      "Three staycations in different buildings and I've stopped checking the other sites. The short list is the good list.",
    avatarBg: "bg-[#E4EEF5]",
    avatarFg: "text-[#2C4A6B]",
  },
  {
    name: "Ana Reyes",
    role: "Condo host · Ortigas",
    avatar: "AR",
    rating: 5,
    content:
      "As a host I get humans on chat, clean payouts, and guests who read the house rules. Worth the commission.",
    avatarBg: "bg-[#DFF0EE]",
    avatarFg: "text-[#1F5E58]",
  },
];

/* ————————————————————————————————————————————————————————
   HELPERS
   ———————————————————————————————————————————————————————— */

function AmenityChip({ type }: { type: string }) {
  const map: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
    pool: { icon: Waves, label: "Pool" },
    gym: { icon: Dumbbell, label: "Gym" },
    wifi: { icon: Wifi, label: "Wi-Fi" },
    parking: { icon: Car, label: "Parking" },
  };
  const entry = map[type];
  if (!entry) return null;
  const Icon = entry.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-[#717171]">
      <Icon className="h-3.5 w-3.5" />
      {entry.label}
    </span>
  );
}

function CondoCover({
  bg,
  accent,
  seed = 0,
}: {
  bg: string;
  accent: string;
  seed?: number;
}) {
  // Deterministic pseudo-variation for silhouette composition
  const offset = (seed * 37) % 100;
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${bg}`}>
      {/* soft light halo */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(circle at ${30 + (offset % 30)}% 25%, rgba(255,255,255,0.6), transparent 55%)`,
        }}
      />
      {/* building silhouette — bottom */}
      <svg
        viewBox="0 0 400 260"
        className="absolute inset-x-0 bottom-0 w-full h-[62%]"
        preserveAspectRatio="none"
        aria-hidden
      >
        <g className={`${accent} [&>*]:fill-current`}>
          <rect x={10 + (offset % 20)} y="130" width="50" height="130" opacity="0.25" />
          <rect x={70} y="90" width="70" height="170" opacity="0.4" />
          <rect x={150} y="60" width="90" height="200" opacity="0.55" />
          <rect x={250} y="100" width="55" height="160" opacity="0.35" />
          <rect x={315} y="40" width="75" height="220" opacity="0.7" />
        </g>
        {/* little window dots */}
        <g fill="white" opacity="0.35">
          {Array.from({ length: 18 }).map((_, i) => {
            const x = 160 + (i % 6) * 12;
            const y = 80 + Math.floor(i / 6) * 16;
            return <rect key={i} x={x} y={y} width="5" height="6" rx="1" />;
          })}
        </g>
      </svg>
      {/* subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.6) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
    </div>
  );
}

/* ————————————————————————————————————————————————————————
   PAGE
   ———————————————————————————————————————————————————————— */

export default function HomePage() {
  return (
    <div
      className="bg-white text-[#222222]"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      <style>{`
        :root { --display: var(--font-display), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .font-display { font-family: var(--display); letter-spacing: -0.02em; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .float-in { animation: float-in 0.7s cubic-bezier(.2,.7,.2,1) both; }
      `}</style>

      {/* ———————————————————————————————————————————————————
          HERO — soft warm gradient, centered headline, pill search
          ——————————————————————————————————————————————————— */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF4F0] via-[#FFF9F6] to-white">
        {/* Decorative orbs */}
        <div className="absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#FDE8E4] blur-3xl opacity-70" />
        <div className="absolute -bottom-40 -left-24 h-[32rem] w-[32rem] rounded-full bg-[#FFE9D6] blur-3xl opacity-60" />

        <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-20 pb-16 md:pb-24">
          <div className="max-w-3xl mx-auto text-center float-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/70 backdrop-blur px-3 py-1.5 text-xs text-[#717171] mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[#E0484F]" />
              <span>
                New this week — <span className="text-[#222222] font-medium">24 condos</span> in Cebu & Baguio
              </span>
            </div>

            <h1 className="font-display text-[2.75rem] sm:text-6xl md:text-7xl font-extrabold leading-[1.02] text-[#222222]">
              Find your next{" "}
              <span className="relative inline-block">
                <span className="relative z-10">condo stay</span>
                <span className="absolute left-0 right-0 bottom-1 md:bottom-2 h-3 md:h-4 bg-[#FDD3CB] z-0 rounded-sm" />
              </span>
              <br />
              in the Philippines.
            </h1>

            <p className="mt-6 text-base md:text-lg text-[#717171] max-w-xl mx-auto leading-relaxed">
              Handpicked, verified condominiums in every major city — booked by
              the night, the week, or the month. No surprise fees, no stock
              photos.
            </p>
          </div>

          {/* Pill search bar */}
          <form
            className="relative max-w-4xl mx-auto mt-10 md:mt-12 float-in"
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex flex-col md:flex-row md:items-stretch rounded-3xl md:rounded-full bg-white border border-[#E5E7EB] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] overflow-hidden">
              <label className="group flex-1 flex flex-col gap-0.5 px-6 py-4 md:py-3.5 hover:bg-[#F7F7F7] cursor-text transition-colors">
                <span className="text-[11px] font-semibold text-[#222222] uppercase tracking-wider">
                  Where
                </span>
                <input
                  type="text"
                  placeholder="Makati, BGC, Cebu, Boracay…"
                  className="bg-transparent border-0 outline-none text-sm text-[#222222] placeholder:text-[#9CA3AF]"
                />
              </label>

              <div className="hidden md:block w-px bg-[#EBEBEB] my-2" />

              <label className="group flex-1 flex flex-col gap-0.5 px-6 py-4 md:py-3.5 hover:bg-[#F7F7F7] cursor-text transition-colors">
                <span className="text-[11px] font-semibold text-[#222222] uppercase tracking-wider">
                  Check in
                </span>
                <input
                  type="text"
                  placeholder="Add date"
                  className="bg-transparent border-0 outline-none text-sm text-[#222222] placeholder:text-[#9CA3AF]"
                />
              </label>

              <div className="hidden md:block w-px bg-[#EBEBEB] my-2" />

              <label className="group flex-1 flex flex-col gap-0.5 px-6 py-4 md:py-3.5 hover:bg-[#F7F7F7] cursor-text transition-colors">
                <span className="text-[11px] font-semibold text-[#222222] uppercase tracking-wider">
                  Check out
                </span>
                <input
                  type="text"
                  placeholder="Add date"
                  className="bg-transparent border-0 outline-none text-sm text-[#222222] placeholder:text-[#9CA3AF]"
                />
              </label>

              <div className="hidden md:block w-px bg-[#EBEBEB] my-2" />

              <label className="group flex-1 flex flex-col gap-0.5 px-6 py-4 md:py-3.5 hover:bg-[#F7F7F7] cursor-text transition-colors">
                <span className="text-[11px] font-semibold text-[#222222] uppercase tracking-wider">
                  Guests
                </span>
                <input
                  type="text"
                  placeholder="Add guests"
                  className="bg-transparent border-0 outline-none text-sm text-[#222222] placeholder:text-[#9CA3AF]"
                />
              </label>

              <div className="flex md:items-center justify-end p-3 md:p-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 w-full md:w-auto md:h-14 md:px-7 py-3 rounded-full bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
                >
                  <Search className="h-4 w-4" strokeWidth={2.5} />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick city chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-[#717171]">
            <span className="mr-2">Popular:</span>
            {["Makati", "BGC", "Ortigas", "Cebu", "Boracay", "Baguio"].map((c) => (
              <Link
                key={c}
                href={`/units?city=${c}`}
                className="px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white hover:border-[#222222] hover:text-[#222222] transition-colors"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ———————————————————————————————————————————————————
          CATEGORY STRIP
          ——————————————————————————————————————————————————— */}
      <section className="sticky top-16 md:top-[4.5rem] z-30 bg-white border-b border-[#EBEBEB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto py-3">
            {categories.map((c) => (
              <button
                key={c.label}
                className={`shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${
                  c.active
                    ? "bg-[#222222] text-white font-medium"
                    : "text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222]"
                }`}
              >
                {c.label}
              </button>
            ))}
            <div className="shrink-0 ml-2 pl-3 border-l border-[#EBEBEB]">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E7EB] text-sm text-[#222222] hover:border-[#222222] transition-colors">
                <span className="i">Filters</span>
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#222222] text-white text-[10px] font-semibold">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ———————————————————————————————————————————————————
          FEATURED CONDOS — card grid
          ——————————————————————————————————————————————————— */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20">
        <div className="flex items-end justify-between gap-6 mb-8 md:mb-10">
          <div>
            <p className="text-sm text-[#E0484F] font-semibold mb-2 uppercase tracking-wider">
              Handpicked this week
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[#222222]">
              Condos our team actually stays in
            </h2>
          </div>
          <Link
            href="/units"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#E0484F] transition-colors"
          >
            View all 548
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
          {featured.map((u, i) => (
            <Link
              key={u.id}
              href={`/units/${u.id}`}
              className="group block"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]">
                  <CondoCover bg={u.bg} accent={u.accent} seed={i} />
                </div>

                {/* Badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white text-[11px] font-semibold text-[#222222] shadow-sm">
                  {u.badge}
                </span>

                {/* Heart */}
                <button
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
                  aria-label="Save to wishlist"
                >
                  <Heart className="h-4 w-4 text-[#222222]" />
                </button>

                {/* pagination dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {[0, 1, 2, 3, 4].map((d) => (
                    <span
                      key={d}
                      className={`h-1.5 rounded-full ${
                        d === 0 ? "w-1.5 bg-white" : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Meta */}
              <div className="mt-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[15px] text-[#222222] leading-snug line-clamp-1">
                    {u.title}
                  </h3>
                  <div className="inline-flex items-center gap-1 text-sm text-[#222222] shrink-0">
                    <Star className="h-3.5 w-3.5 fill-[#222222]" />
                    <span className="font-medium">{u.rating}</span>
                    <span className="text-[#717171]">({u.reviews})</span>
                  </div>
                </div>
                <p className="text-sm text-[#717171] mt-0.5 line-clamp-1">
                  {u.locality}
                </p>
                <p className="text-[13px] text-[#9CA3AF] line-clamp-1">
                  {u.building}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  {u.amenities.map((a) => (
                    <AmenityChip key={a} type={a} />
                  ))}
                </div>
                <p className="mt-3 text-[15px] text-[#222222]">
                  <span className="font-semibold">₱{u.nightly.toLocaleString()}</span>
                  <span className="text-[#717171]"> / night · </span>
                  <span className="font-semibold">₱{u.monthly.toLocaleString()}</span>
                  <span className="text-[#717171]"> / mo</span>
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 md:hidden text-center">
          <Link
            href="/units"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#222222] text-white text-sm font-semibold"
          >
            View all 548 condos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ———————————————————————————————————————————————————
          DESTINATIONS
          ——————————————————————————————————————————————————— */}
      <section className="bg-[#FAFAFA] border-y border-[#EBEBEB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20">
          <div className="mb-8 md:mb-10">
            <p className="text-sm text-[#E0484F] font-semibold mb-2 uppercase tracking-wider">
              Explore the archipelago
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[#222222] max-w-2xl">
              Inspiration for your next stay
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {destinations.map((d, i) => (
              <Link
                key={d.city}
                href={`/units?city=${d.city}`}
                className={`group relative block rounded-2xl overflow-hidden ${
                  i === 0 ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <div className={`relative ${i === 0 ? "aspect-[2/1.3] md:aspect-[2.2/1.6]" : "aspect-[4/3]"}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${d.bg} transition-transform duration-700 group-hover:scale-[1.05]`}>
                    {/* silhouette */}
                    <svg
                      viewBox="0 0 400 260"
                      className="absolute inset-x-0 bottom-0 w-full h-[70%]"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <g fill="rgba(0,0,0,0.22)">
                        <rect x="10" y="130" width="50" height="130" />
                        <rect x="70" y="90" width="70" height="170" />
                        <rect x="150" y="60" width="90" height="200" />
                        <rect x="250" y="100" width="55" height="160" />
                        <rect x="315" y="40" width="75" height="220" />
                      </g>
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className={`font-display font-extrabold leading-tight ${i === 0 ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"}`}>
                          {d.city}
                        </h3>
                        {i === 0 && (
                          <p className="text-white/85 mt-2 text-sm md:text-base max-w-md">
                            {d.blurb}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs uppercase tracking-wider text-white/70">
                          Condos
                        </div>
                        <div className="font-display text-xl md:text-2xl font-bold">
                          {d.count}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ———————————————————————————————————————————————————
          WHY — reasons
          ——————————————————————————————————————————————————— */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <p className="text-sm text-[#E0484F] font-semibold mb-2 uppercase tracking-wider">
            Why kondohub
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[#222222]">
            A smarter way to book a condo
          </h2>
          <p className="mt-4 text-[#717171] text-base md:text-lg">
            Not another marketplace. A small team, real inventory, and a phone
            that someone actually picks up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reasons.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                className="group p-6 rounded-2xl bg-white border border-[#EBEBEB] hover:border-[#222222] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] transition-all"
              >
                <div className="h-12 w-12 rounded-xl bg-[#FDE8E4] text-[#C13947] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-[#222222]">
                  {r.title}
                </h3>
                <p className="mt-2 text-sm text-[#717171] leading-relaxed">
                  {r.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ———————————————————————————————————————————————————
          HOW IT WORKS
          ——————————————————————————————————————————————————— */}
      <section className="bg-[#FAFAFA] border-y border-[#EBEBEB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20">
          <div className="flex items-end justify-between mb-10 md:mb-14 gap-6 flex-wrap">
            <div>
              <p className="text-sm text-[#E0484F] font-semibold mb-2 uppercase tracking-wider">
                How it works
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[#222222] max-w-2xl">
                From search to keycode in four taps
              </h2>
            </div>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  className="relative p-6 rounded-2xl bg-white border border-[#EBEBEB]"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[#E0484F] font-display text-3xl font-extrabold">
                      {s.n}
                    </span>
                    <Icon className="h-5 w-5 text-[#222222]" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#222222]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#717171] leading-relaxed">
                    {s.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ———————————————————————————————————————————————————
          TESTIMONIALS
          ——————————————————————————————————————————————————— */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <p className="text-sm text-[#E0484F] font-semibold mb-2 uppercase tracking-wider">
            Reviews
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[#222222]">
            4.93 out of 5 — and counting
          </h2>
          <div className="mt-4 inline-flex items-center gap-3 text-sm text-[#717171]">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#E0484F] text-[#E0484F]" />
              ))}
            </div>
            <span>10,420 nights booked · 3,280 verified reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="p-6 rounded-2xl bg-white border border-[#EBEBEB] hover:border-[#222222] transition-colors"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#222222] text-[#222222]" />
                ))}
              </div>
              <blockquote className="text-[#222222] leading-relaxed">
                &ldquo;{t.content}&rdquo;
              </blockquote>
              <figcaption className="mt-5 pt-5 border-t border-[#EBEBEB] flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${t.avatarBg} ${t.avatarFg}`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-[#222222] text-sm">{t.name}</div>
                  <div className="text-xs text-[#717171]">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ———————————————————————————————————————————————————
          HOST CTA
          ——————————————————————————————————————————————————— */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-14 md:pb-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#222222] via-[#2A2422] to-[#3A2520]">
          {/* decorative glow */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#E0484F]/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#F29969]/20 blur-3xl" />

          <div className="relative grid md:grid-cols-5 gap-10 items-center p-8 md:p-16">
            <div className="md:col-span-3">
              <div className="inline-flex items-center gap-2 text-[#FDD3CB] text-xs font-semibold uppercase tracking-wider mb-4">
                <TrendingUp className="h-3.5 w-3.5" />
                For condo owners
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-[1.05]">
                Turn your condo
                <br />
                into income.
              </h2>
              <p className="mt-5 text-white/75 max-w-xl leading-relaxed">
                List your unit on kondohub and reach thousands of verified
                travelers. Clean payouts, guests who read house rules, and a
                host manager on call.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/signup?role=owner"
                  className="inline-flex items-center gap-2 bg-white text-[#222222] px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-[#FDE8E4] transition-colors"
                >
                  List your condo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/hosts"
                  className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  How payouts work
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-6 max-w-md">
                <div>
                  <div className="font-display text-2xl font-extrabold text-white">
                    ₱48k
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    avg. monthly payout
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-white">
                    87%
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    occupancy rate
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-white">
                    24h
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    to approve & list
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 relative hidden md:block">
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFE8D1] via-[#FFCFA8] to-[#F29969]">
                  <svg
                    viewBox="0 0 400 400"
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="xMidYMax slice"
                    aria-hidden
                  >
                    <g fill="rgba(0,0,0,0.25)">
                      <rect x="30" y="180" width="70" height="220" />
                      <rect x="110" y="120" width="90" height="280" />
                      <rect x="210" y="80" width="100" height="320" />
                      <rect x="320" y="150" width="70" height="250" />
                    </g>
                    <g fill="rgba(255,255,255,0.4)">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const x = 125 + (i % 6) * 13;
                        const y = 140 + Math.floor(i / 6) * 18;
                        return <rect key={i} x={x} y={y} width="5" height="7" rx="1" />;
                      })}
                    </g>
                  </svg>
                </div>
                <div className="absolute top-5 left-5 px-3 py-1.5 rounded-lg bg-white/95 text-[#222222] text-xs font-semibold shadow-md inline-flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-[#E0484F]" />
                  Superhost status
                </div>
                <div className="absolute bottom-5 right-5 px-3 py-2 rounded-xl bg-white/95 shadow-md">
                  <div className="text-xs text-[#717171]">This month</div>
                  <div className="text-lg font-bold text-[#222222]">
                    ₱52,400
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ———————————————————————————————————————————————————
          TRUST STRIP
          ——————————————————————————————————————————————————— */}
      <section className="border-t border-[#EBEBEB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          {[
            { icon: Shield, label: "Secure payments", sub: "PCI-compliant, Stripe-powered" },
            { icon: Award, label: "Verified listings", sub: "Every unit inspected" },
            { icon: Clock, label: "24/7 support", sub: "Manila-based humans" },
            { icon: Star, label: "4.93 rating", sub: "3,280 verified reviews" },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-[#F7F7F7] flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[#222222]" />
                </div>
                <div>
                  <div className="font-semibold text-[#222222]">{t.label}</div>
                  <div className="text-[#717171] text-xs">{t.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
