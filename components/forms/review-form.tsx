"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star, Loader2, ArrowRight } from "lucide-react";

type Props = {
  bookingId: string;
  unitName: string;
};

export function ReviewForm({ bookingId, unitName }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Please choose a rating between 1 and 5 stars");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || "Could not submit review");
        return;
      }
      toast.success("Thanks for the review!");
      router.push(`/bookings/${bookingId}`);
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const labels = ["", "Disappointing", "Could be better", "Solid", "Great", "Loved it"];
  const display = hover || rating;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-2xl border border-[#EBEBEB] bg-white p-8">
        <p className="text-sm text-[#E0484F] font-semibold uppercase tracking-wider mb-2">
          Step 1 · Rating
        </p>
        <h2
          className="text-2xl font-extrabold text-[#222222] tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          How was your stay at {unitName}?
        </h2>
        <p className="mt-2 text-sm text-[#717171]">
          Honest reviews keep the platform useful for the next guest.
        </p>

        <div
          className="mt-6 flex items-center gap-1.5"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="p-1.5 rounded-full hover:bg-[#FDE8E4] transition-colors"
              aria-label={`Rate ${n} out of 5`}
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  n <= display
                    ? "fill-[#E0484F] text-[#E0484F]"
                    : "text-[#E5E7EB]"
                }`}
              />
            </button>
          ))}
          {display > 0 && (
            <span className="ml-3 text-sm font-semibold text-[#222222]">
              {labels[display]}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#EBEBEB] bg-white p-8">
        <p className="text-sm text-[#E0484F] font-semibold uppercase tracking-wider mb-2">
          Step 2 · Tell us more
        </p>
        <h2
          className="text-2xl font-extrabold text-[#222222] tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          What stood out?
        </h2>
        <p className="mt-2 text-sm text-[#717171]">Optional, but helpful.</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="The aircon worked, the WiFi was fast, the view was unreal…"
          rows={6}
          className="mt-5 rounded-xl border-[#E5E7EB] resize-none"
        />
        <p className="mt-2 text-xs text-[#9CA3AF]">
          {comment.length} / 1000 characters
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || rating < 1}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-6 py-3 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit review <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </form>
  );
}
