"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StarRatingDisplay } from "@/components/StarRating";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsColumn } from "@/components/ReviewsColumn";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useReviewsWidget } from "@/components/ReviewsWidgetContext";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
};

export function ReviewsWidget() {
  const { open, openReviews, closeReviews } = useReviewsWidget();
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
        onClick={() => openReviews()}
        style={{ writingMode: "vertical-rl" }}
        className="animate-tab-pulse fixed right-0 top-[48%] z-40 -translate-y-1/2 rounded-l-lg bg-brass px-2.5 py-4 font-body text-xs font-semibold uppercase tracking-wider text-navy transition-transform hover:-translate-x-0.5 hover:bg-brass/90"
      >
        ★ Customer Reviews
      </button>

      {open && (
        <div
          className="animate-modal-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-navy/55 px-4 py-8 backdrop-blur-[2px]"
          onClick={() => closeReviews()}
        >
          <div
            className="animate-modal-card-in flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative shrink-0 overflow-hidden border-b border-navy/10 bg-gradient-to-b from-blush/50 to-white px-6 pb-6 pt-7 text-center">
              <button
                type="button"
                onClick={() => closeReviews()}
                aria-label="Close"
                className="group absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-navy/40 transition-colors hover:bg-navy/6 hover:text-navy"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-4.5 w-4.5 transition-transform duration-300 group-hover:rotate-90"
                >
                  <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
                </svg>
              </button>
              <h2 className="font-display text-2xl text-navy">Let customers speak for us</h2>
              {count > 0 ? (
                <>
                  <div className="mt-3 flex justify-center">
                    <StarRatingDisplay rating={Math.round(average)} className="h-5 w-5" animate />
                  </div>
                  <p className="mt-1.5 font-body text-xs text-navy/50">
                    {average.toFixed(1)} average &middot; {count} review{count === 1 ? "" : "s"}
                  </p>
                </>
              ) : (
                !loading && (
                  <p className="mt-2 font-body text-xs text-navy/50">No reviews yet. Be the first!</p>
                )
              )}
              <button
                type="button"
                onClick={() => setShowForm((s) => !s)}
                className="group relative mt-4 overflow-hidden rounded-full bg-navy px-6 py-2.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
              >
                <span className="relative z-10">{showForm ? "Hide form" : "Write a review"}</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              {showForm && (
                <ScrollReveal className="mb-5">
                  <ReviewForm />
                </ScrollReveal>
              )}

              {loading && (
                <div className="flex flex-col items-center gap-2 py-6">
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 animate-spin text-brass">
                    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
                    <path d="M17.5 10a7.5 7.5 0 0 0-7.5-7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="font-body text-sm text-navy/50">Loading reviews…</p>
                </div>
              )}

              {!loading && count === 0 && !showForm && (
                <p className="text-center font-body text-sm text-navy/50">
                  Be the first to share how it went.
                </p>
              )}

              {!loading && count > 0 && (
                <div className="space-y-4">
                  <ScrollReveal className="relative overflow-hidden rounded-2xl bg-blush/40 p-6 text-center">
                    <span className="font-display text-5xl italic leading-none text-brass/70">&ldquo;</span>
                    <p className="-mt-2 font-display text-xl italic leading-snug text-navy">
                      {reviews[0].review_text}
                    </p>
                    <div className="mt-3 flex justify-center">
                      <StarRatingDisplay rating={reviews[0].rating} />
                    </div>
                    <p className="mt-2 font-body text-xs font-semibold text-navy/60">
                      {reviews[0].customer_name}
                    </p>
                  </ScrollReveal>

                  {reviews.length > 1 && (
                    <ScrollReveal delayMs={100}>
                      <ReviewsColumn reviews={reviews.slice(1)} />
                    </ScrollReveal>
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
