"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckoutStore } from "@/lib/checkout-store";
import { createClient } from "@/lib/supabase/client";
import { getCustomerSession } from "@/lib/customer-session";
import { AuthShell } from "@/components/AuthShell";
import { AuthInput, MAIL_ICON, LOCK_ICON } from "@/components/AuthInput";
import { ScrollReveal } from "@/components/ScrollReveal";

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
    <AuthShell
      image="/brand/05_sweet_making.png"
      headline="Welcome back."
      tagline="Sign in to track your orders, revisit your saved address, and reorder your favourites in a couple of taps."
    >
      <ScrollReveal>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/20 text-brass">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
            <circle cx="10" cy="7" r="3.25" />
            <path d="M3.5 17c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" strokeLinecap="round" />
          </svg>
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={60}>
        <h1 className="mt-5 text-center font-display text-4xl text-navy">Sign in</h1>
        <p className="mt-2 text-center font-body text-sm text-navy/60">
          See your past orders and delivery details.
        </p>
      </ScrollReveal>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-3.5">
        <ScrollReveal delayMs={120}>
          <AuthInput
            icon={MAIL_ICON}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((f) => ({ ...f, email: undefined }));
            }}
            error={fieldErrors.email}
          />
        </ScrollReveal>

        <ScrollReveal delayMs={170}>
          <AuthInput
            icon={LOCK_ICON}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((f) => ({ ...f, password: undefined }));
            }}
            error={fieldErrors.password}
          />
        </ScrollReveal>

        <ScrollReveal delayMs={220} className="-mt-1 flex justify-end">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetting}
            className="font-body text-xs text-navy/50 transition-colors hover:text-brass disabled:opacity-60"
          >
            {resetting ? "Sending…" : "Forgot password?"}
          </button>
        </ScrollReveal>
        {resetSent && <p className="text-right font-body text-xs text-sage">Password reset email sent.</p>}
        {resetError && <p className="text-right font-body text-xs text-brass">{resetError}</p>}

        {error && <p className="font-body text-xs text-brass">{error}</p>}

        <ScrollReveal delayMs={270}>
          <button
            type="submit"
            disabled={submitting}
            className="group relative w-full overflow-hidden rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            <span className="relative z-10">{submitting ? "Signing in…" : "Sign in"}</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
        </ScrollReveal>
      </form>

      <ScrollReveal delayMs={320}>
        <Link
          href={`/account/signup?redirect=${encodeURIComponent(redirectTo)}`}
          className="mt-6 block text-center font-body text-xs text-navy/50 hover:text-brass"
        >
          New here? Create an account
        </Link>
      </ScrollReveal>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
