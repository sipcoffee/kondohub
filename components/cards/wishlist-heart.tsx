"use client";

import { Heart } from "lucide-react";

export function WishlistHeart() {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
      aria-label="Save to wishlist"
    >
      <Heart className="h-4 w-4 text-[#222222]" />
    </button>
  );
}
