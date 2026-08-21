"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const fieldClass =
  "rounded-lg border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }
    router.refresh();
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="/seed/susi_hands.jpg"
          alt="Susi's hands making sweets"
          fill
          sizes="50vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy/25" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="font-display text-4xl italic text-white">Truly Susi&rsquo;s</p>
          <p className="mt-1 font-body text-sm text-white/80">Sweeter together.</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream px-6 py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-2xl border border-navy/10 bg-white p-8"
        >
          <h1 className="font-display text-2xl text-navy">Admin sign in</h1>
          <p className="mt-1 font-body text-sm text-navy/60">Sign in with your admin account.</p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-5 w-full ${fieldClass}`}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-3 w-full ${fieldClass}`}
          />

          {error && <p className="mt-3 font-body text-sm text-brass">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
