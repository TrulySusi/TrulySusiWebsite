"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createAdminSessionClient } from "@/lib/supabase/admin-session-client";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

const fieldClass =
  "rounded-lg border border-white/20 bg-white/10 px-4 py-3 font-body text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white/40";

function errorFieldClass(hasError: boolean) {
  return `rounded-lg border bg-white/10 px-4 py-3 font-body text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-1 ${
    hasError ? "border-brass focus:ring-brass/60" : "border-white/20 focus:ring-white/40"
  }`;
}

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const [resetting, setResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

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
    const supabase = createAdminSessionClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }
    router.refresh();
  }

  async function handleForgotPassword() {
    setResetError(null);
    setResetSent(false);
    if (!email.trim() || !isValidEmail(email)) {
      setFieldErrors((f) => ({ ...f, email: "Enter your email above, then tap Forgot password." }));
      return;
    }

    setResetting(true);
    const supabase = createAdminSessionClient();
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/reset-password?next=admin`,
    });
    setResetting(false);

    if (resetErr) {
      setResetError(resetErr.message);
      return;
    }
    setResetSent(true);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-navy px-6 py-16 lg:justify-end lg:pr-24 xl:pr-32">
      <Image
        src="/brand/admin_bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-navy/45" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-black/50 p-8 text-center backdrop-blur-md"
      >
        <h1 className="font-display text-2xl text-white">Admin sign in</h1>
        <p className="mt-1 text-center font-body text-sm text-white/70">
          Sign in with your admin account.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((f) => ({ ...f, email: undefined }));
          }}
          className={`mt-5 w-full ${errorFieldClass(!!fieldErrors.email)}`}
        />
        {fieldErrors.email && (
          <p className="mt-1 text-left font-body text-xs text-brass">{fieldErrors.email}</p>
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((f) => ({ ...f, password: undefined }));
          }}
          className={`mt-3 w-full ${errorFieldClass(!!fieldErrors.password)}`}
        />
        {fieldErrors.password && (
          <p className="mt-1 text-left font-body text-xs text-brass">{fieldErrors.password}</p>
        )}

        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={resetting}
          className="mt-2 font-body text-xs text-white/60 hover:text-white disabled:opacity-60"
        >
          {resetting ? "Sending…" : "Forgot password?"}
        </button>
        {resetSent && (
          <p className="mt-1 text-center font-body text-xs text-sage">
            Check your email for a reset link.
          </p>
        )}
        {resetError && (
          <p className="mt-1 text-center font-body text-xs text-brass">{resetError}</p>
        )}

        {error && <p className="mt-3 text-center font-body text-sm text-brass">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-full bg-brass px-6 py-3.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-brass/90 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
