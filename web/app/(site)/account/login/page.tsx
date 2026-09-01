"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckoutStore } from "@/lib/checkout-store";
import { createClient } from "@/lib/supabase/client";
import { getCustomerSession } from "@/lib/customer-session";
import { Breadcrumb } from "@/components/Breadcrumb";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account/orders";
  const clearCheckoutDraft = useCheckoutStore((s) => s.clear);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const [resetting, setResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    getCustomerSession().then((session) => {
      if (session) router.replace(redirectTo);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!email.trim()) errors.email = "Enter your email.";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError(authError?.message ?? "Couldn't log in. Please try again.");
      setSubmitting(false);
      return;
    }

    await supabase.from("customers").upsert({ id: data.user.id, email: data.user.email }, { onConflict: "id" });

    clearCheckoutDraft();
    router.push(redirectTo);
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
    <main className="mx-auto max-w-md px-6 py-24 sm:px-10">
      <Breadcrumb items={[{ label: "Sign In" }]} />
      <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-10 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brass/20 text-brass">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-8 w-8">
            <circle cx="10" cy="7" r="3.25" />
            <path d="M3.5 17c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="mt-4 text-center font-display text-3xl text-navy">Sign in</h1>
        <p className="mt-2 text-center font-body text-sm text-navy/60">
          See your past orders and delivery details.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((f) => ({ ...f, email: undefined }));
            }}
            className={`rounded-lg border bg-white px-4 py-3.5 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 ${
              fieldErrors.email ? "border-brass focus:ring-brass/40" : "border-navy/15 focus:ring-navy/20"
            }`}
          />
          {fieldErrors.email && <p className="mt-1 font-body text-xs text-brass">{fieldErrors.email}</p>}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((f) => ({ ...f, password: undefined }));
            }}
            className={`mt-3 rounded-lg border bg-white px-4 py-3.5 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 ${
              fieldErrors.password ? "border-brass focus:ring-brass/40" : "border-navy/15 focus:ring-navy/20"
            }`}
          />
          {fieldErrors.password && <p className="mt-1 font-body text-xs text-brass">{fieldErrors.password}</p>}

          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetting}
            className="mt-2 self-start font-body text-xs text-navy/50 hover:text-brass disabled:opacity-60"
          >
            {resetting ? "Sending…" : "Forgot password?"}
          </button>
          {resetSent && <p className="mt-1 font-body text-xs text-sage">Password reset email sent.</p>}
          {resetError && <p className="mt-1 font-body text-xs text-brass">{resetError}</p>}

          {error && <p className="mt-3 font-body text-xs text-brass">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <Link
        href={`/account/signup?redirect=${encodeURIComponent(redirectTo)}`}
        className="mt-6 block text-center font-body text-xs text-navy/50 hover:text-brass"
      >
        New here? Create an account
      </Link>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
