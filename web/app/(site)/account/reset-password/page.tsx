"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("next") === "admin";
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase's client detects the recovery token in the URL and
    // establishes a session automatically; just wait for that to settle
    // before showing the form.
    const supabase = createClient();
    supabase.auth.getSession().then(() => setReady(true));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
  }

  if (!ready) return null;

  if (done) {
    return (
      <main className="mx-auto max-w-sm px-6 py-24 text-center sm:px-10">
        <h1 className="font-display text-3xl text-navy">Password updated</h1>
        <p className="mt-3 font-body text-sm text-navy/60">
          You can now log in with your new password.
        </p>
        <button
          type="button"
          onClick={() => router.push(isAdmin ? "/admin" : "/checkout")}
          className="mt-8 rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          {isAdmin ? "Continue to admin" : "Continue to checkout"}
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-24 sm:px-10">
      <h1 className="font-display text-3xl text-navy text-center">Set a new password</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-navy/15 bg-cream px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-3 rounded-lg border border-navy/15 bg-cream px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20"
        />

        {error && <p className="mt-3 font-body text-xs text-brass">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Update password"}
        </button>
      </form>
    </main>
  );
}
