"use client";

import { useState, useTransition } from "react";
import { StarRatingDisplay } from "@/components/StarRating";
import { approveReview, unapproveReview, deleteReview } from "@/app/admin/reviews/actions";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  approved: boolean;
  created_at: string;
};

function ReviewCard({ review }: { review: Review }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: (id: string) => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action(review.id);
      } catch {
        setError("Something went wrong. Try again.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-navy/10 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <StarRatingDisplay rating={review.rating} />
          <p className="mt-2 font-body text-sm leading-relaxed text-navy/80">
            {review.review_text}
          </p>
          <p className="mt-2 font-body text-xs font-semibold text-navy/50">
            {review.customer_name} &middot; {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {review.approved ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(unapproveReview)}
              className="rounded-full border border-navy/20 px-4 py-1.5 font-body text-xs font-semibold text-navy transition-colors hover:bg-navy/6 disabled:opacity-60"
            >
              Unapprove
            </button>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(approveReview)}
              className="rounded-full bg-sage px-4 py-1.5 font-body text-xs font-semibold text-navy transition-colors hover:bg-sage/90 disabled:opacity-60"
            >
              Approve
            </button>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (confirm("Delete this review permanently?")) run(deleteReview);
            }}
            className="rounded-full px-4 py-1.5 font-body text-xs font-semibold text-brass transition-colors hover:bg-brass/10 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>
      {error && <p className="mt-2 font-body text-xs text-brass">{error}</p>}
    </div>
  );
}

export function AdminReviewsList({ reviews }: { reviews: Review[] }) {
  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="font-body text-xl font-semibold text-navy">
          Pending ({pending.length})
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {pending.length === 0 ? (
            <p className="font-body text-sm text-navy/50">Nothing waiting on approval.</p>
          ) : (
            pending.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>
      </section>

      <section>
        <h2 className="font-body text-xl font-semibold text-navy">
          Approved ({approved.length})
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {approved.length === 0 ? (
            <p className="font-body text-sm text-navy/50">No approved reviews yet.</p>
          ) : (
            approved.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>
      </section>
    </div>
  );
}
