"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StarRatingDisplay } from "@/components/StarRating";
import { ReviewForm } from "@/components/ReviewForm";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
};

export function ReviewsWidget() {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!open || loaded) return;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("reviews")
      .select("id, customer_name, rating, review_text, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setReviews((data as Review[]) ?? []);
        setLoaded(true);
        setLoading(false);
      });
  }, [open, loaded]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ writingMode: "vertical-rl" }}
        className="fixed right-0 top-[48%] z-40 -translate-y-1/2 rounded-l-lg bg-brass px-2.5 py-4 font-body text-xs font-semibold uppercase tracking-wider text-navy shadow-lg transition-colors hover:bg-brass/90"
      >
        ★ Customer Reviews
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 px-4 py-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative shrink-0 border-b border-navy/10 px-6 pb-5 pt-6 text-center">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 text-navy/40 transition-colors hover:text-navy"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                  <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
                </svg>
              </button>
              <h2 className="font-display text-2xl text-navy">Let customers speak for us</h2>
              {count > 0 ? (
                <>
                  <div className="mt-2 flex justify-center">
                    <StarRatingDisplay rating={Math.round(average)} />
                  </div>
                  <p className="mt-1 font-body text-xs text-navy/50">
                    {average.toFixed(1)} average &middot; {count} review{count === 1 ? "" : "s"}
                  </p>
                </>
              ) : (
                !loading && (
                  <p className="mt-2 font-body text-xs text-navy/50">No reviews yet — be the first!</p>
                )
              )}
              <button
                type="button"
                onClick={() => setShowForm((s) => !s)}
                className="mt-4 rounded-full bg-navy px-6 py-2.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
              >
                {showForm ? "Hide form" : "Write a review"}
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              {showForm && (
                <div className="mb-5">
                  <ReviewForm />
                </div>
              )}

              {loading && <p className="text-center font-body text-sm text-navy/50">Loading…</p>}

              {!loading && count === 0 && !showForm && (
                <p className="text-center font-body text-sm text-navy/50">
                  Be the first to share how it went.
                </p>
              )}

              {!loading && count > 0 && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-blush/40 p-6 text-center">
                    <span className="font-display text-4xl italic text-brass">&ldquo;</span>
                    <p className="-mt-3 font-display text-xl italic leading-snug text-navy">
                      {reviews[0].review_text}
                    </p>
                    <div className="mt-3 flex justify-center">
                      <StarRatingDisplay rating={reviews[0].rating} />
                    </div>
                    <p className="mt-2 font-body text-xs font-semibold text-navy/60">
                      {reviews[0].customer_name}
                    </p>
                  </div>

                  {reviews.length > 1 && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {reviews.slice(1).map((review) => (
                        <div key={review.id} className="rounded-xl border border-navy/10 p-4">
                          <StarRatingDisplay rating={review.rating} className="h-3.5 w-3.5" />
                          <p className="mt-2 font-body text-sm leading-relaxed text-navy/75">
                            {review.review_text}
                          </p>
                          <p className="mt-2 font-body text-xs font-semibold text-navy/50">
                            {review.customer_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
