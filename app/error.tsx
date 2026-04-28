"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 bg-gradient-to-b from-[#FFF4F0] via-white to-white">
      <div className="max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#FDE8E4] text-[#C13947] flex items-center justify-center mb-6">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1
          className="text-3xl md:text-4xl font-extrabold text-[#222222] tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Something just tripped a wire.
        </h1>
        <p className="mt-3 text-[#717171] leading-relaxed">
          Don&apos;t worry — it&apos;s us, not you. Our team has been notified
          {error.digest ? <> (ref <code className="text-xs">{error.digest}</code>)</> : null}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-6 py-3 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
          >
            Try again
            <ArrowRight className="h-4 w-4" />
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-[#E5E7EB] text-[#222222] px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#F7F7F7] transition-colors"
          >
            <Home className="h-4 w-4" />
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
