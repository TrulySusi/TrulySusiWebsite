"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function SignupPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (mounted && items.length === 0) router.replace("/cart");
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) return null;

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!email.trim()) errors.email = "Enter your email.";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Choose a password.";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
    if (confirm !== password) errors.confirm = "Passwords don't match.";
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

    router.push("/checkout/delivery");
  }

  if (checkEmail) {
    return (
      <main className="mx-auto max-w-sm px-6 py-24 text-center sm:px-10">
        <h1 className="font-display text-3xl text-navy">Confirm your email</h1>
        <p className="mt-3 font-body text-sm text-navy/60">
          We&rsquo;ve sent a confirmation link to {email}. Once you&rsquo;ve confirmed, come back
          and log in.
        </p>
        <Link
          href="/checkout"
          className="mt-8 inline-block rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          Back to checkout
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-24 sm:px-10">
      <h1 className="text-center font-display text-3xl text-navy">Create an account</h1>
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
          className={`rounded-lg border bg-cream px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 ${
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
          className={`mt-3 rounded-lg border bg-cream px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 ${
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
          className={`mt-3 rounded-lg border bg-cream px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 ${
            fieldErrors.confirm ? "border-brass focus:ring-brass/40" : "border-navy/15 focus:ring-navy/20"
          }`}
        />
        {fieldErrors.confirm && (
          <p className="mt-1 font-body text-xs text-brass">{fieldErrors.confirm}</p>
        )}

        {error && <p className="mt-3 font-body text-xs text-brass">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <Link
          href="/checkout"
          className="mt-4 text-center font-body text-xs text-navy/50 hover:text-brass"
        >
          Already have an account? Log in
        </Link>
      </form>
    </main>
  );
}
