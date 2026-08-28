"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckoutStore } from "@/lib/checkout-store";
import { createClient } from "@/lib/supabase/client";

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
      <main className="mx-auto max-w-md px-6 py-24 sm:px-10">
        <div className="rounded-2xl border border-navy/10 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/20 text-sage">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-8 w-8">
              <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
              <path d="m3 5.5 7 5.5 7-5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-4 font-display text-3xl text-navy">Confirm your email</h1>
          <p className="mt-3 font-body text-sm text-navy/60">
            We&rsquo;ve sent a confirmation link to {email}. Once you&rsquo;ve confirmed, come back
            and log in.
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="mt-4 font-body text-xs text-navy/50 hover:text-brass disabled:opacity-60"
          >
            {resending ? "Resending…" : "Didn't get it? Resend the email"}
          </button>
          {resendSent && (
            <p className="mt-1 font-body text-xs text-sage">Confirmation email resent.</p>
          )}
          {resendError && <p className="mt-1 font-body text-xs text-brass">{resendError}</p>}

          <Link
            href={`/account/login?redirect=${encodeURIComponent(redirectTo)}`}
            className="mt-8 inline-block rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-24 sm:px-10">
      <div className="rounded-2xl border border-navy/10 bg-white p-10 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brass/20 text-brass">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-8 w-8">
            <circle cx="10" cy="7" r="3.25" />
            <path d="M3.5 17c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="mt-4 text-center font-display text-3xl text-navy">Create an account</h1>
        <p className="mt-2 text-center font-body text-sm text-navy/60">
          So your orders and address are ready next time.
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
          {fieldErrors.password && (
            <p className="mt-1 font-body text-xs text-brass">{fieldErrors.password}</p>
          )}

          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setFieldErrors((f) => ({ ...f, confirm: undefined }));
            }}
            className={`mt-3 rounded-lg border bg-white px-4 py-3.5 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 ${
              fieldErrors.confirm ? "border-brass focus:ring-brass/40" : "border-navy/15 focus:ring-navy/20"
            }`}
          />
          {fieldErrors.confirm && (
            <p className="mt-1 font-body text-xs text-brass">{fieldErrors.confirm}</p>
          )}

          <label className="mt-4 flex items-start gap-2.5 font-body text-xs text-navy/70">
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

          {error && <p className="mt-3 font-body text-xs text-brass">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>

      <Link
        href={`/account/login?redirect=${encodeURIComponent(redirectTo)}`}
        className="mt-6 block text-center font-body text-xs text-navy/50 hover:text-brass"
      >
        Already have an account? Log in
      </Link>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}
