import { Mail, Phone, MapPin, Clock, ArrowRight, Sparkles } from "lucide-react";
import { ContactForm } from "./form";

export const metadata = {
  title: "Contact",
  description: "Real humans, Manila-based, picking up the phone.",
};

const channels = [
  {
    icon: Mail,
    label: "Email us",
    detail: "hello@kondohub.example",
    href: "mailto:hello@kondohub.example",
    sub: "Replies within 4 hours, Mon–Sun",
  },
  {
    icon: Phone,
    label: "Call or WhatsApp",
    detail: "+63 917 555 0188",
    href: "tel:+639175550188",
    sub: "24/7 — yes, even brownouts",
  },
  {
    icon: MapPin,
    label: "Visit",
    detail: "BGC, Taguig, Metro Manila",
    href: "#",
    sub: "By appointment, weekdays",
  },
];

export default function ContactPage() {
  return (
    <div
      className="bg-white text-[#222222]"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF4F0] via-[#FFF9F6] to-white">
        <div className="absolute -top-32 -right-24 h-[24rem] w-[24rem] rounded-full bg-[#FDE8E4] blur-3xl opacity-70" />

        <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-16 md:pt-24 pb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/70 backdrop-blur px-3 py-1.5 text-xs text-[#717171] mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[#E0484F]" />
              We&apos;re here, actually.
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.02em] leading-[1.05]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Talk to a human.
            </h1>
            <p className="mt-5 text-base md:text-lg text-[#717171] leading-relaxed max-w-xl">
              Booking question, a tour idea, a pitch deck — pick a channel and
              we&apos;ll get back fast.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-20">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Channels */}
          <aside className="lg:col-span-2 space-y-3">
            {channels.map((c) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.label}
                  href={c.href}
                  className="group flex items-start gap-4 rounded-2xl border border-[#EBEBEB] bg-white p-5 hover:border-[#222222] hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.12)] transition-all"
                >
                  <div className="h-11 w-11 rounded-xl bg-[#FDE8E4] text-[#C13947] flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[#717171]">
                      {c.label}
                    </p>
                    <p
                      className="mt-1 text-lg font-bold tracking-[-0.01em]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {c.detail}
                    </p>
                    <p className="text-xs text-[#717171] mt-1">{c.sub}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#E0484F] transition-colors mt-3 shrink-0" />
                </a>
              );
            })}

            <div className="rounded-2xl border border-[#EBEBEB] bg-[#FAFAFA] p-5">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#717171] inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Response time
              </p>
              <p className="mt-2 text-sm text-[#222222]">
                Email and form submissions: <span className="font-semibold">≤ 4 hours</span>{" "}
                during the day. Phone & WhatsApp are picked up at any time.
              </p>
            </div>
          </aside>

          {/* Form */}
          <div className="lg:col-span-3 rounded-2xl border border-[#EBEBEB] bg-white p-7 md:p-9">
            <h2
              className="text-2xl font-extrabold tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Drop us a note
            </h2>
            <p className="mt-2 text-sm text-[#717171]">
              We read every message. Promise.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
