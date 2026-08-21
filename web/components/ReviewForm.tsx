"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StarRatingInput } from "@/components/StarRating";

export function ReviewForm() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !text.trim() || rating < 1) {
      setError("Please add your name, a rating, and a few words.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("reviews").insert({
      customer_name: name.trim(),
      rating,
      review_text: text.trim(),
    });
    setSubmitting(false);

    if (insertError) {
      setError("Couldn't submit your review. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-navy/10 bg-white p-7 text-center">
        <h2 className="font-display text-2xl text-navy">Thank you!</h2>
        <p className="mt-2 font-body text-sm text-navy/60">
          Your review has been submitted and will appear here once it&rsquo;s approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-navy/10 bg-white p-7">
      <h2 className="font-display text-2xl text-navy">Write a review</h2>

      <div className="mt-5 flex flex-col gap-1">
        <span className="font-body text-xs font-semibold text-navy/60">Your rating</span>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-4 w-full rounded-lg border border-navy/15 bg-cream px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20"
      />
      <textarea
        placeholder="What did you think?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="mt-3 w-full resize-none rounded-lg border border-navy/15 bg-cream px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20"
      />

      {error && <p className="mt-3 font-body text-sm text-brass">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
