import { StarRatingDisplay } from "@/components/StarRating";
import { ScrollReveal } from "@/components/ScrollReveal";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
};

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function reviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-[0_1px_2px_rgba(4,28,53,.04),0_8px_24px_-12px_rgba(4,28,53,.1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(4,28,53,.06),0_12px_28px_-12px_rgba(4,28,53,.18)]">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass/15 font-body text-sm font-bold text-brass">
          {initial(review.customer_name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-sm font-semibold text-navy">
            {review.customer_name}
          </p>
          <StarRatingDisplay rating={review.rating} className="mt-0.5 h-3.5 w-3.5" />
        </div>
        <span className="shrink-0 self-start font-body text-[11px] text-navy/40">
          {reviewDate(review.created_at)}
        </span>
      </div>
      <p className="mt-3 text-left! font-body text-sm leading-relaxed text-navy/75">
        {review.review_text}
      </p>
    </div>
  );
}

/**
 * Every review gets the same treatment — the first one used to render as a
 * large pull-quote, which read as a different kind of thing entirely when
 * there were only a couple of reviews. The modal body does the scrolling, so
 * this is a plain list rather than its own scroll area.
 */
export function ReviewsColumn({ reviews }: { reviews: Review[] }) {
  return (
    <div className="flex flex-col gap-3.5">
      {reviews.map((review, i) => (
        <ScrollReveal key={review.id} delayMs={Math.min(i, 6) * 80}>
          <ReviewCard review={review} />
        </ScrollReveal>
      ))}
    </div>
  );
}
