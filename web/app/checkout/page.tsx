"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function CheckoutEntryPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const [resetting, setResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    if (mounted && items.length === 0) router.replace("/cart");
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) return null;

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!email.trim()) errors.email = "Enter your email.";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
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

  async function handleForgotPassword() {
    setResetError(null);
    setResetSent(false);
    if (!email.trim() || !isValidEmail(email)) {
      setFieldErrors((f) => ({ ...f, email: "Enter your email above, then tap Forgot password." }));
      return;
    }

    setResetting(true);
    const supabase = createClient();
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/reset-password`,
    });
    setResetting(false);

    if (resetErr) {
      setResetError(resetErr.message);
      return;
    }
    setResetSent(true);
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
          noValidate
          className="flex flex-col rounded-2xl border border-navy/10 bg-white p-7"
        >
          <span className="invisible inline-block w-fit rounded-full px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-wider">
            Fastest
          </span>
          <div className="mt-2 flex items-center gap-2.5">
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
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((f) => ({ ...f, email: undefined }));
            }}
            className={`mt-5 rounded-lg border bg-cream px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 ${
              fieldErrors.email ? "border-brass focus:ring-brass/40" : "border-navy/15 focus:ring-navy/20"
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1 font-body text-xs text-brass">{fieldErrors.email}</p>
          )}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((f) => ({ ...f, password: undefined }));
            }}
            className={`mt-3 rounded-lg border bg-cream px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 ${
              fieldErrors.password ? "border-brass focus:ring-brass/40" : "border-navy/15 focus:ring-navy/20"
            }`}
          />
          {fieldErrors.password && (
            <p className="mt-1 font-body text-xs text-brass">{fieldErrors.password}</p>
          )}

          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetting}
            className="mt-2 self-end font-body text-xs text-navy/50 hover:text-brass disabled:opacity-60"
          >
            {resetting ? "Sending…" : "Forgot password?"}
          </button>
          {resetSent && (
            <p className="mt-1 font-body text-xs text-sage">
              Check your email for a reset link.
            </p>
          )}
          {resetError && <p className="mt-1 font-body text-xs text-brass">{resetError}</p>}

          {error && <p className="mt-3 font-body text-xs text-brass">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
          <Link
            href="/account/signup"
            className="mt-4 text-center font-body text-xs text-navy/50 hover:text-brass"
          >
            New here? Create an account
          </Link>
        </form>

        <div className="flex flex-col rounded-2xl border border-navy/10 bg-white p-7">
          <span className="inline-block w-fit rounded-full bg-blush px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-wider text-brass">
            Fastest
          </span>
          <div className="mt-2 flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass/15 text-brass">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                <path d="M11 2 4 12h5l-1 6 7-10h-5l1-6Z" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-navy">Continue as guest</h2>
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
