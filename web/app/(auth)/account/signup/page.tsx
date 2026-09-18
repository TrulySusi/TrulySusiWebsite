"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckoutStore } from "@/lib/checkout-store";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { AuthInput, MAIL_ICON, LOCK_ICON } from "@/components/AuthInput";
import { ScrollReveal } from "@/components/ScrollReveal";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account/orders";
  const clearCheckoutDraft = useCheckoutStore((s) => s.clear);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
    terms?: string;
  }>({});
  const [checkEmail, setCheckEmail] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!email.trim()) errors.email = "Enter your email.";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Choose a password.";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
    if (confirm !== password) errors.confirm = "Passwords don't match.";
    if (!agreedToTerms) errors.terms = "Please agree to the Terms & Conditions and Privacy Policy to continue.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    if (!data.session) {
      // Email confirmation is required before a session is issued.
      setCheckEmail(true);
      setSubmitting(false);
      return;
    }

    if (data.user) {
      await supabase
        .from("customers")
        .upsert({ id: data.user.id, email: data.user.email }, { onConflict: "id" });
    }

    clearCheckoutDraft();
    router.push(redirectTo);
  }

  async function handleResend() {
    setResendError(null);
    setResendSent(false);
    setResending(true);
    const supabase = createClient();
    const { error: resendErr } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);

    if (resendErr) {
      setResendError(resendErr.message);
      return;
    }
    setResendSent(true);
  }

  if (checkEmail) {
    return (
      <AuthShell
        image="/brand/04_cooking_kitchen.png"
        headline="Almost there."
        tagline="One quick email confirmation and your account is ready to track orders and save your address."
      >
        <ScrollReveal className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/20 text-sage">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
              <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
              <path d="m3 5.5 7 5.5 7-5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-5 font-display text-4xl text-navy">Confirm your email</h1>
          <p className="mx-auto mt-3 max-w-sm text-center! font-body text-sm text-navy/60">
            We&rsquo;ve sent a confirmation link to {email}. Once you&rsquo;ve confirmed, come back
            and log in.
          </p>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-body text-xs font-semibold text-brass hover:text-navy disabled:opacity-60"
              >
                {resending ? "Resending…" : "Didn't get it? Resend the email"}
              </button>
              {resendSent && <p className="font-body text-xs text-sage">Confirmation email resent.</p>}
              {resendError && <p className="font-body text-xs text-brass">{resendError}</p>}
            </div>

            <Link
              href={`/account/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="inline-block rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
            >
              Back to sign in
            </Link>
          </div>
        </ScrollReveal>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      image="/brand/04_cooking_kitchen.png"
      headline="Join the kitchen."
      tagline="Create an account so your orders, address, and delivery details are ready the next time you visit."
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
        <h1 className="mt-5 text-center font-display text-4xl text-navy">Create an account</h1>
        <p className="mt-2 text-center font-body text-sm text-navy/60">
          So your orders and address are ready next time.
        </p>
      </ScrollReveal>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-3.5">
        <ScrollReveal delayMs={110}>
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

        <ScrollReveal delayMs={150}>
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

        <ScrollReveal delayMs={190}>
          <AuthInput
            icon={LOCK_ICON}
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setFieldErrors((f) => ({ ...f, confirm: undefined }));
            }}
            error={fieldErrors.confirm}
          />
        </ScrollReveal>

        <ScrollReveal delayMs={230}>
          <label className="flex items-start gap-2.5 font-body text-xs text-navy/70">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                setFieldErrors((f) => ({ ...f, terms: undefined }));
              }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy/30 text-navy focus:ring-1 focus:ring-navy/20"
            />
            <span>
              I agree to the{" "}
              <Link href="/policies/terms" target="_blank" className="text-brass underline hover:text-navy">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/policies/privacy" target="_blank" className="text-brass underline hover:text-navy">
                Privacy Policy
              </Link>
            </span>
          </label>
          {fieldErrors.terms && <p className="mt-1 font-body text-xs text-brass">{fieldErrors.terms}</p>}
        </ScrollReveal>

        {error && <p className="font-body text-xs text-brass">{error}</p>}

        <ScrollReveal delayMs={270}>
          <button
            type="submit"
            disabled={submitting}
            className="group relative w-full overflow-hidden rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            <span className="relative z-10">{submitting ? "Creating account…" : "Create account"}</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
        </ScrollReveal>
      </form>

      <ScrollReveal delayMs={320}>
        <Link
          href={`/account/login?redirect=${encodeURIComponent(redirectTo)}`}
          className="mt-6 block text-center font-body text-xs text-navy/50 hover:text-brass"
        >
          Already have an account? Log in
        </Link>
      </ScrollReveal>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}
