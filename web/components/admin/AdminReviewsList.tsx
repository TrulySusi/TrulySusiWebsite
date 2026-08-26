"use client";

import { useState, useTransition } from "react";
import { StarRatingDisplay } from "@/components/StarRating";
import { AdminProductTabs } from "@/components/admin/AdminProductTabs";
import { approveReview, unapproveReview, deleteReview } from "@/app/admin/reviews/actions";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  approved: boolean;
  created_at: string;
};

function StatCard({ label, value, color }: { label: string; value: string; color: "navy" | "brass" | "sage" }) {
  const styles = {
    navy: { bg: "bg-navy/5", border: "border-navy/15", text: "text-navy" },
    brass: { bg: "bg-brass/10", border: "border-brass/25", text: "text-brass" },
    sage: { bg: "bg-sage/10", border: "border-sage/25", text: "text-sage" },
  }[color];
  return (
    <div className={`rounded-2xl border p-5 ${styles.bg} ${styles.border}`}>
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-navy/50">{label}</p>
      <p className={`mt-2 font-body text-3xl font-bold ${styles.text}`}>{value}</p>
    </div>
  );
}

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
    <div
      className={`rounded-xl border-l-4 border-navy/10 bg-white p-5 shadow-sm ${
        review.approved ? "border-l-sage" : "border-l-brass"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <StarRatingDisplay rating={review.rating} />
            <span
              className={`rounded-full px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide ${
                review.approved ? "bg-sage/20 text-sage" : "bg-brass/15 text-brass"
              }`}
            >
              {review.approved ? "Live" : "Pending"}
            </span>
          </div>
          <p className="mt-2.5 font-body text-[15px] leading-relaxed text-navy/85">
            &ldquo;{review.review_text}&rdquo;
          </p>
          <p className="mt-2.5 font-body text-xs font-semibold text-navy/50">
            {review.customer_name} &middot;{" "}
            {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
  const average = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total reviews" value={String(reviews.length)} color="navy" />
        <StatCard label="Pending" value={String(pending.length)} color="brass" />
        <StatCard label="Live" value={String(approved.length)} color="sage" />
        <StatCard label="Average rating" value={reviews.length > 0 ? average.toFixed(1) : "—"} color="navy" />
      </div>

      <AdminProductTabs
        tabs={[
          {
            id: "pending",
            label: `Pending (${pending.length})`,
            content: (
              <div className="flex flex-col gap-3">
                {pending.length === 0 ? (
                  <p className="font-body text-sm text-navy/50">Nothing waiting on approval.</p>
                ) : (
                  pending.map((r) => <ReviewCard key={r.id} review={r} />)
                )}
              </div>
            ),
          },
          {
            id: "approved",
            label: `Live (${approved.length})`,
            content: (
              <div className="flex flex-col gap-3">
                {approved.length === 0 ? (
                  <p className="font-body text-sm text-navy/50">No approved reviews yet.</p>
                ) : (
                  approved.map((r) => <ReviewCard key={r.id} review={r} />)
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
