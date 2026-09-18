import { StarRatingDisplay } from "@/components/StarRating";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
};

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="w-full shrink-0 rounded-3xl border border-navy/10 bg-white p-6 shadow-[0_1px_2px_rgba(4,28,53,.04),0_8px_24px_-12px_rgba(4,28,53,.12)]">
      <StarRatingDisplay rating={review.rating} className="h-3.5 w-3.5" />
      <p className="mt-3 font-body text-sm leading-relaxed text-navy/75">{review.review_text}</p>
      <div className="mt-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brass/15 font-body text-xs font-bold text-brass">
          {initial(review.customer_name)}
        </span>
        <span className="font-body text-xs font-semibold text-navy/70">{review.customer_name}</span>
      </div>
    </div>
  );
}

/**
 * A vertically-scrolling column of review cards. Only animates once there
 * are enough real reviews to loop without it being obviously the same
 * couple of cards over and over — below that it's just a still list, which
 * is the honest thing to show rather than padding it out with anything
 * fake to make the scroll look fuller.
 */
export function ReviewsColumn({ reviews }: { reviews: Review[] }) {
  const animate = reviews.length >= 5;
  const items = animate ? [...reviews, ...reviews] : reviews;

  return (
    <div className="max-h-[420px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
      <div className={`flex flex-col gap-4 ${animate ? "animate-reviews-scroll" : ""}`}>
        {items.map((review, i) => (
          <ReviewCard key={`${review.id}-${i}`} review={review} />
        ))}
      </div>
    </div>
  );
}
