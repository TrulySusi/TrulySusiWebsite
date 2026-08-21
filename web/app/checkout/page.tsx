"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutEntryPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mounted && items.length === 0) router.replace("/cart");
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError(authError?.message ?? "Couldn't log in. Please try again.");
      setSubmitting(false);
      return;
    }

    // Make sure a customers row exists for this auth user (first login
    // after account creation) so the delivery step can attach an address
    // to it. RLS restricts this to the signed-in user's own row.
    await supabase
      .from("customers")
      .upsert({ id: data.user.id, email: data.user.email }, { onConflict: "id" });

    router.push("/checkout/delivery");
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <div className="text-center">
        <h1 className="font-display text-4xl text-navy">How would you like to check out?</h1>
        <p className="mt-3 font-body text-navy/60">
          Log in to track orders faster, or continue as a guest. Either way, you can place this
          order.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <form
          onSubmit={handleLogin}
          className="flex flex-col rounded-2xl border border-navy/10 bg-white p-7"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass/15 text-brass">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
                <circle cx="10" cy="7" r="3" />
                <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-navy">Log in</h2>
          </div>
          <p className="mt-1 font-body text-sm text-navy/60">
            Track your orders and reorder favourites in one tap.
          </p>

          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-5 rounded-lg border border-navy/15 bg-cream px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-3 rounded-lg border border-navy/15 bg-cream px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20"
          />

          {error && <p className="mt-3 font-body text-xs text-brass">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in & continue"}
          </button>
        </form>

        <div className="flex flex-col rounded-2xl border border-navy/10 bg-white p-7">
          <span className="inline-block w-fit rounded-full bg-blush px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-brass">
            Fastest
          </span>
          <div className="mt-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass/15 text-brass">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                <path d="M11 2 4 12h5l-1 6 7-10h-5l1-6Z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-navy">Continue as guest</h2>
          </div>
          <p className="mt-1 font-body text-sm text-navy/60">
            No account needed. Enter your delivery details next and place your order in under a
            minute.
          </p>

          <button
            type="button"
            onClick={() => router.push("/checkout/delivery")}
            className="mt-8 rounded-full border-2 border-navy px-6 py-3 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </main>
  );
}
