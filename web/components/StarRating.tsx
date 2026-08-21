function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-full w-full"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    >
      <path d="M10 2.8l2.14 4.53 4.96.62-3.63 3.5.94 4.95L10 13.9l-4.41 2.5.94-4.95-3.63-3.5 4.96-.62L10 2.8Z" />
    </svg>
  );
}

export function StarRatingDisplay({ rating, className = "h-4 w-4" }: { rating: number; className?: string }) {
  return (
    <div className="flex gap-0.5 text-brass" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={className}>
          <Star filled={n <= rating} />
        </span>
      ))}
    </div>
  );
}

export function StarRatingInput({
  value,
  onChange,
  className = "h-7 w-7",
}: {
  value: number;
  onChange: (rating: number) => void;
  className?: string;
}) {
  return (
    <div className="flex gap-1 text-brass" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className={`${className} cursor-pointer transition-transform hover:scale-110`}
        >
          <Star filled={n <= value} />
        </button>
      ))}
    </div>
  );
}
