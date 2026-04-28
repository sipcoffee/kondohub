import Link from "next/link";
import { Compass, ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 bg-gradient-to-b from-[#FFF4F0] via-white to-white">
      <div className="max-w-lg text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#FDE8E4] text-[#C13947] flex items-center justify-center mb-6">
          <Compass className="h-6 w-6" />
        </div>
        <p className="text-sm text-[#E0484F] font-semibold uppercase tracking-wider mb-2">
          404 · Page not found
        </p>
        <h1
          className="text-4xl md:text-5xl font-extrabold text-[#222222] tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          You&apos;re a few floors off.
        </h1>
        <p className="mt-4 text-[#717171] leading-relaxed">
          The page you&apos;re looking for has either moved, been retired, or
          never existed in the first place. The good news: we have 548 condos
          waiting for you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/units"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-6 py-3 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
          >
            <Search className="h-4 w-4" />
            Browse condos
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-[#E5E7EB] text-[#222222] px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#F7F7F7] transition-colors"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
