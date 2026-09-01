"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ReviewsWidgetContextValue = {
  open: boolean;
  openReviews: () => void;
  closeReviews: () => void;
};

const ReviewsWidgetContext = createContext<ReviewsWidgetContextValue | null>(null);

// Lets any component (the floating tab, a footer link, anything else
// later) open the same reviews modal instead of each having its own
// separate open/closed state.
export function ReviewsWidgetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <ReviewsWidgetContext.Provider
      value={{ open, openReviews: () => setOpen(true), closeReviews: () => setOpen(false) }}
    >
      {children}
    </ReviewsWidgetContext.Provider>
  );
}

export function useReviewsWidget() {
  const ctx = useContext(ReviewsWidgetContext);
  if (!ctx) throw new Error("useReviewsWidget must be used within a ReviewsWidgetProvider");
  return ctx;
}
