import Link from "next/link";
import { Building2, Sparkles, Shield, Award } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Brand panel — left on desktop, top on mobile */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FFF4F0] via-[#FFF9F6] to-white lg:w-1/2 px-6 sm:px-10 py-10 lg:py-14 lg:px-14 flex flex-col">
        <div
          className="absolute -top-20 -right-16 h-72 w-72 rounded-full bg-[#FDE8E4] blur-3xl opacity-70"
          aria-hidden
        />
        <div
          className="absolute -bottom-24 -left-12 h-80 w-80 rounded-full bg-[#FFE9D6] blur-3xl opacity-60"
          aria-hidden
        />

        <Link href="/" className="relative inline-flex items-center gap-2 w-fit">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0484F] to-[#D5256E] text-white shadow-[0_4px_12px_-3px_rgba(224,72,79,0.5)]">
            <Building2 className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-extrabold text-[#222222]">
            kondo<span className="text-[#E0484F]">hub</span>
          </span>
        </Link>

        <div className="relative flex-1 flex items-center mt-10 lg:mt-0">
          <div className="max-w-md">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-4">
              Find your next stay
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#222222] leading-[1.05]">
              Handpicked condos.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">Honest pricing.</span>
                <span
                  className="absolute left-0 right-0 bottom-1 h-3 bg-[#FDD3CB] z-0 rounded-sm"
                  aria-hidden
                />
              </span>
            </h2>
            <p className="mt-5 text-[#717171] leading-relaxed">
              Book by the night, the week, or the month. No surprise fees, real
              photos, and humans on call when you need them.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm">
              {[
                { icon: Shield, label: "Verified" },
                { icon: Award, label: "Superhosts" },
                { icon: Sparkles, label: "No surprises" },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.label} className="text-center">
                    <div className="h-10 w-10 mx-auto rounded-xl bg-white border border-[#EBEBEB] flex items-center justify-center text-[#222222]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-2 text-xs text-[#717171] font-medium">
                      {b.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="relative text-xs text-[#9CA3AF] mt-10 hidden lg:block">
          © {new Date().getFullYear()} KondoHub · Made in the Philippines
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10 lg:py-14">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
