import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Users,
  Heart,
  Handshake,
  Compass,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "About",
  description:
    "Hand-picked condominiums across the Philippines, run by a small team that answers the phone.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Verified, not crowdsourced",
    body: "Every condo on kondohub is personally inspected. No drone shots from the brochure, no ghost listings.",
  },
  {
    icon: Heart,
    title: "Honest, not slick",
    body: "What you see at checkout is what you pay. No invented resort fees, no surprise association dues.",
  },
  {
    icon: Handshake,
    title: "Hosts we'd grab coffee with",
    body: "We curate hosts, not just listings. Quick replies, clean keys, good vibes.",
  },
  {
    icon: Compass,
    title: "Local, not lifted",
    body: "Built in Metro Manila, with neighborhood guides written by people who actually live there.",
  },
];

const milestones = [
  { year: "2024", title: "First 10 condos", body: "All in BGC and Makati. Friends and family beta." },
  { year: "2025", title: "Five cities", body: "Cebu, Baguio, Boracay, Tagaytay, and Davao come online." },
  { year: "2026", title: "548 verified condos", body: "Across the archipelago. 4.93 average rating." },
];

const team = [
  {
    name: "Maria Reyes",
    role: "Co-founder & CEO",
    bg: "from-[#FDE8E4] to-[#F4C0B5]",
    fg: "text-[#C13947]",
    initials: "MR",
  },
  {
    name: "James Tan",
    role: "Co-founder & CTO",
    bg: "from-[#E4EEF5] to-[#AAC4DA]",
    fg: "text-[#2C4A6B]",
    initials: "JT",
  },
  {
    name: "Anna Cruz",
    role: "Head of Hosts",
    bg: "from-[#DFF0EE] to-[#8FC9C2]",
    fg: "text-[#1F5E58]",
    initials: "AC",
  },
  {
    name: "Lito Mendoza",
    role: "Operations",
    bg: "from-[#FFE8D1] to-[#F29969]",
    fg: "text-[#A13E1A]",
    initials: "LM",
  },
];

export default function AboutPage() {
  return (
    <div
      className="bg-white text-[#222222]"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF4F0] via-[#FFF9F6] to-white">
        <div className="absolute -top-32 -right-24 h-[26rem] w-[26rem] rounded-full bg-[#FDE8E4] blur-3xl opacity-70" />
        <div className="absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#FFE9D6] blur-3xl opacity-60" />

        <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-16 md:pt-24 pb-16 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/70 backdrop-blur px-3 py-1.5 text-xs text-[#717171] mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[#E0484F]" />
              About kondohub
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.02em] leading-[1.05]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              We curate condos.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">A real team picks them.</span>
                <span className="absolute left-0 right-0 bottom-1 md:bottom-2 h-3 md:h-4 bg-[#FDD3CB] z-0 rounded-sm" />
              </span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-[#717171] leading-relaxed max-w-2xl">
              kondohub started after the third bad staycation in a row. Stock
              photos that didn&apos;t match the unit, hosts who couldn&apos;t
              be reached, surprise fees at checkout. We thought we could do
              better — so we did.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-2xl mb-12">
          <p className="text-sm text-[#E0484F] font-semibold mb-2 uppercase tracking-wider">
            What we believe
          </p>
          <h2
            className="text-3xl md:text-5xl font-extrabold tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Boring, repeated until it&apos;s remarkable.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="group p-7 rounded-2xl bg-white border border-[#EBEBEB] hover:border-[#222222] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-[#FDE8E4] text-[#C13947] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <h3
                  className="mt-5 text-xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {v.title}
                </h3>
                <p className="mt-2 text-[#717171] leading-relaxed">{v.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Milestones */}
      <section
        id="how"
        className="bg-[#FAFAFA] border-y border-[#EBEBEB]"
      >
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
          <div className="max-w-2xl mb-12">
            <p className="text-sm text-[#E0484F] font-semibold mb-2 uppercase tracking-wider">
              Our story
            </p>
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Three years, one Wi-Fi router at a time.
            </h2>
          </div>
          <ol className="grid md:grid-cols-3 gap-5">
            {milestones.map((m) => (
              <li
                key={m.year}
                className="rounded-2xl bg-white border border-[#EBEBEB] p-6"
              >
                <p
                  className="text-3xl font-extrabold text-[#E0484F]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {m.year}
                </p>
                <h3
                  className="mt-3 text-xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {m.title}
                </h3>
                <p className="mt-2 text-[#717171] leading-relaxed text-sm">
                  {m.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-2xl mb-12">
          <p className="text-sm text-[#E0484F] font-semibold mb-2 uppercase tracking-wider">
            The team
          </p>
          <h2
            className="text-3xl md:text-5xl font-extrabold tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Small enough to answer the phone.
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {team.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-[#EBEBEB] bg-white p-6 text-center"
            >
              <div
                className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center text-xl font-bold bg-gradient-to-br ${t.bg} ${t.fg}`}
              >
                {t.initials}
              </div>
              <p className="mt-4 font-semibold">{t.name}</p>
              <p className="text-xs text-[#717171]">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-[#222222] via-[#2A2422] to-[#3A2520] p-10 md:p-14 text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#E0484F]/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[#FDD3CB] text-xs font-semibold uppercase tracking-wider mb-4">
              <Users className="h-3.5 w-3.5" />
              Join us
            </div>
            <h2
              className="text-3xl md:text-5xl font-extrabold leading-[1.05]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              We&apos;re building the booking experience we always wanted.
            </h2>
            <p className="mt-5 text-white/75 leading-relaxed">
              Whether you&apos;re a guest, a host, or a candidate — we&apos;d love to
              hear from you.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white text-[#222222] px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-[#FDE8E4] transition-colors"
              >
                Talk to us
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/units"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Browse condos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
