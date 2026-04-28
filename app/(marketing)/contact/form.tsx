"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

const topics = [
  { value: "guest", label: "Booking question" },
  { value: "host", label: "Listing my condo" },
  { value: "press", label: "Press / partnerships" },
  { value: "other", label: "Something else" },
];

export function ContactForm() {
  const [topic, setTopic] = useState("guest");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill out all required fields");
      return;
    }
    setSubmitting(true);
    // No backend handler yet — this would send to a /api/contact route.
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Message received — we'll be in touch soon.");
    setName("");
    setEmail("");
    setMessage("");
    setSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#222222]">
          What&apos;s this about?
        </label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTopic(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                topic === t.value
                  ? "bg-[#222222] text-white"
                  : "bg-[#F7F7F7] text-[#717171] hover:bg-[#EBEBEB]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FieldShell label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maria Santos"
            className="bg-transparent border-0 outline-none text-sm text-[#222222] placeholder:text-[#9CA3AF] w-full"
            required
          />
        </FieldShell>
        <FieldShell label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-transparent border-0 outline-none text-sm text-[#222222] placeholder:text-[#9CA3AF] w-full"
            required
          />
        </FieldShell>
      </div>

      <FieldShell label="Message">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Tell us what you're thinking about — dates, condo details, ideas, gripes."
          className="bg-transparent border-0 outline-none text-sm text-[#222222] placeholder:text-[#9CA3AF] w-full resize-none"
          required
        />
      </FieldShell>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] disabled:opacity-50 transition-shadow"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Send message
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 focus-within:border-[#222222] focus-within:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.10)] transition-all">
      <span className="block text-[10px] font-semibold text-[#222222] uppercase tracking-wider">
        {label}
      </span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}
