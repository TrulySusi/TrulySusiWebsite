"use client";

import { useState } from "react";

export default function TrackOrderPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center sm:px-10">
      <h1 className="font-display text-4xl text-navy">Track your order</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          placeholder="Enter your order ID, e.g. TS-2026-000123"
          className="flex-1 rounded-full border border-navy/15 bg-white px-5 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:border-navy focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-navy px-7 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          Search
        </button>
      </form>

      {submitted && (
        <p className="mt-6 font-body text-sm text-navy/70">
          Order tracking isn&rsquo;t live yet. Once online checkout opens,
          your order status will show up here. For now, every order is
          confirmed and updated directly over WhatsApp or email.
        </p>
      )}
    </main>
  );
}
