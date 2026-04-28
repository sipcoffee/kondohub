import Link from "next/link";
import {
  Building2,
  ArrowRight,
  Globe,
  Shield,
  Star,
  Sparkles,
} from "lucide-react";

/* Brand icons — lucide removed these; inline SVG paths. */
function IconFacebook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
    </svg>
  );
}
function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.849.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function IconYouTube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
function IconTikTok(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.83a8.16 8.16 0 004.77 1.52V6.89a4.77 4.77 0 01-1.84-.2z" />
    </svg>
  );
}

const guestLinks = [
  { label: "Browse condos", href: "/units" },
  { label: "Destinations", href: "/units?view=destinations" },
  { label: "Long-term stays", href: "/units?type=monthly" },
  { label: "Gift cards", href: "/gift-cards" },
  { label: "Wishlist", href: "/wishlist" },
];

const hostLinks = [
  { label: "List your condo", href: "/signup?role=owner" },
  { label: "Host payouts", href: "/hosts" },
  { label: "Host resources", href: "/hosts/resources" },
  { label: "Host community", href: "/hosts/community" },
  { label: "Insurance & cover", href: "/hosts/insurance" },
];

const companyLinks = [
  { label: "About us", href: "/about" },
  { label: "How it works", href: "/about#how" },
  { label: "Careers", href: "/careers" },
  { label: "Press & media", href: "/press" },
  { label: "Journal", href: "/journal" },
];

const supportLinks = [
  { label: "Help center", href: "/help" },
  { label: "Contact us", href: "/contact" },
  { label: "Safety & trust", href: "/safety" },
  { label: "Cancellation", href: "/cancellation" },
  { label: "Report a concern", href: "/report" },
];

const cities = [
  "Makati",
  "BGC",
  "Ortigas",
  "Eastwood",
  "Alabang",
  "Poblacion",
  "Manila Bay",
  "Cebu",
  "Baguio",
  "Boracay",
  "Palawan",
  "Batangas",
  "Davao",
  "Clark",
  "Iloilo",
  "Siargao",
];

export function Footer() {
  return (
    <footer
      className="bg-[#FAFAFA] border-t border-[#EBEBEB] text-[#222222]"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      {/* ——————————————————————————————————————
          Newsletter / lead row
          —————————————————————————————————————— */}
      <div className="mx-auto max-w-7xl px-5 md:px-8 pt-14 md:pt-20 pb-10">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="max-w-lg">
            <Link href="/" className="inline-flex items-center gap-2 mb-5 group">
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0484F] to-[#D5256E] text-white shadow-[0_4px_12px_-3px_rgba(224,72,79,0.5)]">
                <Building2 className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span
                className="text-2xl font-extrabold tracking-[-0.02em] text-[#222222]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                kondo<span className="text-[#E0484F]">hub</span>
              </span>
            </Link>
            <h3
              className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-[#222222] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Hand-picked condos,<br className="hidden md:block" />
              in your inbox every Monday.
            </h3>
            <p className="mt-3 text-sm text-[#717171] max-w-md leading-relaxed">
              New listings, quiet neighborhood guides, and seasonal picks across
              the Philippines. No spam — unsubscribe in one click.
            </p>
          </div>

          <div className="md:justify-self-end w-full md:max-w-md">
            <form className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 bg-white border border-[#E5E7EB] rounded-full px-5 py-3.5 focus-within:border-[#222222] focus-within:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.15)] transition-all">
                <span className="block text-[10px] font-semibold text-[#222222] uppercase tracking-wider">
                  Email
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent border-0 outline-none text-sm text-[#222222] placeholder:text-[#9CA3AF] mt-0.5"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
              >
                Subscribe
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </form>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#717171]">
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#222222]" />
                12,400 subscribers
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#E0484F]" />
                Weekly, not daily
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-[#222222]" />
                4.8 reader rating
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ——————————————————————————————————————
          Link columns
          —————————————————————————————————————— */}
      <div className="border-t border-[#EBEBEB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
            <FooterColumn title="For guests" links={guestLinks} />
            <FooterColumn title="For hosts" links={hostLinks} />
            <FooterColumn title="kondohub" links={companyLinks} />
            <FooterColumn title="Support" links={supportLinks} />
          </div>
        </div>
      </div>

      {/* ——————————————————————————————————————
          Popular destinations
          —————————————————————————————————————— */}
      <div className="border-t border-[#EBEBEB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-10">
          <h4
            className="text-sm font-semibold text-[#222222] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Condos by destination
          </h4>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <Link
                key={city}
                href={`/units?city=${city}`}
                className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-sm text-[#222222] hover:border-[#222222] hover:bg-[#F7F7F7] transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ——————————————————————————————————————
          Bottom bar
          —————————————————————————————————————— */}
      <div className="border-t border-[#EBEBEB]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#717171]">
            <span className="text-[#222222] font-medium">
              © {new Date().getFullYear()} kondohub, Inc.
            </span>
            <Link href="/privacy" className="hover:text-[#222222] transition-colors">
              Privacy
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terms" className="hover:text-[#222222] transition-colors">
              Terms
            </Link>
            <span aria-hidden>·</span>
            <Link href="/sitemap" className="hover:text-[#222222] transition-colors">
              Sitemap
            </Link>
            <span aria-hidden>·</span>
            <Link href="/cookies" className="hover:text-[#222222] transition-colors">
              Cookie preferences
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 text-xs font-semibold text-[#222222] hover:underline">
              <Globe className="h-3.5 w-3.5" />
              English (PH)
            </button>
            <span className="text-[#EBEBEB]">|</span>
            <button className="text-xs font-semibold text-[#222222] hover:underline">
              ₱ PHP
            </button>
            <span className="text-[#EBEBEB] hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-1">
              <SocialIcon href="https://facebook.com" label="Facebook">
                <IconFacebook className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram">
                <IconInstagram className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href="https://tiktok.com" label="TikTok">
                <IconTikTok className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href="https://twitter.com" label="X">
                <IconX className="h-3.5 w-3.5" />
              </SocialIcon>
              <SocialIcon href="https://youtube.com" label="YouTube">
                <IconYouTube className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4
        className="text-sm font-semibold text-[#222222] mb-4"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-[#717171] hover:text-[#E0484F] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#717171] hover:text-white hover:bg-[#222222] transition-colors"
    >
      {children}
    </a>
  );
}
