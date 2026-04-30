import * as React from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  cta?: React.ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  cta,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-2">
          {eyebrow}
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#222222] leading-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-[#717171] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {cta && <div className="shrink-0">{cta}</div>}
    </div>
  );
}
