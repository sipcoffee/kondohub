import * as React from "react";

type Tone = "tenant" | "owner" | "admin";

const TONE_GRADIENT: Record<Tone, string> = {
  tenant: "from-[#FFF4F0] via-[#FFF9F6] to-white",
  owner: "from-[#EFF7F5] via-[#F8FBFA] to-white",
  admin: "from-[#F4F4F4] via-[#FAFAFA] to-white",
};

const TONE_ORB_PRIMARY: Record<Tone, string> = {
  tenant: "bg-[#FDE8E4]",
  owner: "bg-[#DFF0EE]",
  admin: "bg-[#EBEBEB]",
};

const TONE_ORB_SECONDARY: Record<Tone, string> = {
  tenant: "bg-[#FFE9D6]",
  owner: "bg-[#E7EBDC]",
  admin: "bg-[#E4EEF5]",
};

interface DashboardHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  /** Word inside the title that gets the peachy underline accent. */
  highlight?: string;
  subtitle?: React.ReactNode;
  cta?: React.ReactNode;
  tone?: Tone;
}

export function DashboardHero({
  eyebrow,
  title,
  highlight,
  subtitle,
  cta,
  tone = "tenant",
}: DashboardHeroProps) {
  const renderedTitle =
    typeof title === "string" && highlight && title.includes(highlight) ? (
      <>
        {title.split(highlight)[0]}
        <span className="relative inline-block">
          <span className="relative z-10">{highlight}</span>
          <span
            className="absolute left-0 right-0 bottom-1 md:bottom-1.5 h-2.5 md:h-3 bg-[#FDD3CB] z-0 rounded-sm"
            aria-hidden
          />
        </span>
        {title.split(highlight)[1]}
      </>
    ) : (
      title
    );

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-[#EBEBEB] bg-gradient-to-br ${TONE_GRADIENT[tone]} px-6 py-10 md:px-12 md:py-14 float-in`}
    >
      <div
        className={`absolute -top-20 -right-16 h-64 w-64 rounded-full ${TONE_ORB_PRIMARY[tone]} blur-3xl opacity-70`}
        aria-hidden
      />
      <div
        className={`absolute -bottom-24 -left-12 h-72 w-72 rounded-full ${TONE_ORB_SECONDARY[tone]} blur-3xl opacity-60`}
        aria-hidden
      />

      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-3">
            {eyebrow}
          </p>
          <h1 className="font-display text-[2.25rem] sm:text-5xl md:text-[3.5rem] font-extrabold leading-[1.05] text-[#222222]">
            {renderedTitle}
          </h1>
          {subtitle && (
            <p className="mt-4 text-sm md:text-base text-[#717171] leading-relaxed max-w-xl">
              {subtitle}
            </p>
          )}
        </div>
        {cta && <div className="shrink-0">{cta}</div>}
      </div>
    </section>
  );
}
