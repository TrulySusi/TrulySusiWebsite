"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import {
  emptyDelivery,
  useCheckoutStore,
  type AddressLabel,
  type DeliveryDetails,
} from "@/lib/checkout-store";
import { createClient } from "@/lib/supabase/client";
import { INDIA_STATES, lookupPincode } from "@/lib/india";

const ADDRESS_LABELS: AddressLabel[] = ["Home", "Work", "Other"];

const fieldClass =
  "rounded-lg bg-blush px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20";

export default function DeliveryDetailsPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const delivery = useCheckoutStore((s) => s.delivery);
  const setDelivery = useCheckoutStore((s) => s.setDelivery);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [form, setForm] = useState<DeliveryDetails>(emptyDelivery);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) {
      router.replace("/cart");
      return;
    }
    setForm(delivery);
  }, [mounted, items.length, router, delivery]);

  if (!mounted || items.length === 0) return null;

  function update<K extends keyof DeliveryDetails>(field: K, value: DeliveryDetails[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updatePincode(value: string) {
    setForm((f) => ({ ...f, pincode: value }));
    if (/^\d{6}$/.test(value.trim())) {
      lookupPincode(value.trim()).then((result) => {
        if (result) setForm((f) => ({ ...f, city: result.city, state: result.state }));
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const required: Array<keyof DeliveryDetails> = [
      "firstName",
      "lastName",
      "phone",
      "line1",
      "line2",
      "pincode",
      "city",
      "state",
    ];
    const filled = required.every((k) => form[k].trim().length > 0);
    const phoneValid = /^\d{10}$/.test(form.phone.trim());
    const altPhoneValid = !form.alternatePhone.trim() || /^\d{10}$/.test(form.alternatePhone.trim());
    const pincodeValid = /^\d{6}$/.test(form.pincode.trim());

    if (!filled || !phoneValid || !altPhoneValid || !pincodeValid) {
      setError(
        "Please fill every required field (phone numbers must be 10 digits, pincode must be 6 digits).",
      );
      return;
    }
    setError(null);
    setSubmitting(true);
    setDelivery(form);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: existing } = await supabase
        .from("addresses")
        .select("id")
        .eq("customer_id", user.id)
        .eq("is_default", true)
        .maybeSingle();

      const row = {
        customer_id: user.id,
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        alternate_phone: form.alternatePhone || null,
        label: form.label,
        line1: form.line1,
        line2: form.line2,
        landmark: form.landmark || null,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        notes: form.notes || null,
        is_default: true,
      };

      if (existing) {
        await supabase.from("addresses").update(row).eq("id", existing.id);
      } else {
        await supabase.from("addresses").insert(row);
      }
    }

    router.push("/checkout/payment");
    setSubmitting(false);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy font-body text-xs font-semibold text-cream">
            1
          </span>
          <span className="font-body text-sm font-semibold text-navy">Delivery</span>
        </div>
        <span className="h-px w-10 bg-navy/15" />
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy/10 font-body text-xs font-semibold text-navy/50">
            2
          </span>
          <span className="font-body text-sm text-navy/50">Payment</span>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-navy/10 bg-white p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blush text-navy">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path d="M10 17.5s6-4.35 6-9.15A6 6 0 0 0 4 8.35C4 13.15 10 17.5 10 17.5Z" strokeLinejoin="round" />
                <circle cx="10" cy="8" r="2" />
              </svg>
            </div>
            <h1 className="font-display text-2xl text-navy">Delivery details</h1>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {ADDRESS_LABELS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => update("label", label)}
                aria-pressed={form.label === label}
                className={`rounded-full px-5 py-2 font-body text-sm font-medium transition-colors ${
                  form.label === label ? "bg-navy text-cream" : "bg-navy/6 text-navy hover:bg-navy/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className={fieldClass}
            />
            <input
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className={fieldClass}
            />
            <input
              placeholder="Phone number"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={fieldClass}
            />
            <input
              placeholder="Alternate phone (optional)"
              inputMode="numeric"
              value={form.alternatePhone}
              onChange={(e) => update("alternatePhone", e.target.value)}
              className={fieldClass}
            />
            <input
              placeholder="House / Flat / Building no."
              value={form.line1}
              onChange={(e) => update("line1", e.target.value)}
              className={`sm:col-span-2 ${fieldClass}`}
            />
            <input
              placeholder="Street / Area / Locality"
              value={form.line2}
              onChange={(e) => update("line2", e.target.value)}
              className={`sm:col-span-2 ${fieldClass}`}
            />
            <input
              placeholder="Landmark (optional)"
              value={form.landmark}
              onChange={(e) => update("landmark", e.target.value)}
              className={`sm:col-span-2 ${fieldClass}`}
            />
            <input
              placeholder="Pincode"
              inputMode="numeric"
              value={form.pincode}
              onChange={(e) => updatePincode(e.target.value)}
              className={fieldClass}
            />
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className={fieldClass}
            />
            <select
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              className={`sm:col-span-2 ${fieldClass} ${form.state ? "text-navy" : "text-navy/40"}`}
            >
              <option value="" disabled>
                State
              </option>
              {INDIA_STATES.map((s) => (
                <option key={s} value={s} className="text-navy">
                  {s}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Delivery instructions (optional), e.g. leave with security, call before delivery"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className={`sm:col-span-2 resize-none ${fieldClass}`}
            />
          </div>

          {error && <p className="mt-3 font-body text-sm text-brass">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Continue to payment"}
          </button>
        </form>

        <div className="rounded-2xl bg-navy p-6 text-cream">
          <h2 className="font-display text-xl">What to expect</h2>
          <ul className="mt-5 space-y-4">
            <li className="flex gap-3">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 h-5 w-5 shrink-0 text-brass">
                <circle cx="10" cy="10" r="7" />
                <path d="M10 6v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="font-body text-sm font-semibold">Packed fresh to order</p>
                <p className="mt-0.5 font-body text-xs text-cream/60">
                  Dispatch time depends on your location.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 h-5 w-5 shrink-0 text-brass">
                <path d="M3.5 6.5 10 3l6.5 3.5v7L10 17l-6.5-3.5v-7Z" strokeLinejoin="round" />
                <path d="M3.5 6.5 10 10l6.5-3.5M10 10v7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="font-body text-sm font-semibold">Delivery fee</p>
                <p className="mt-0.5 font-body text-xs text-cream/60">
                  Calculated and confirmed before payment.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 h-5 w-5 shrink-0 text-brass">
                <rect x="4.5" y="9" width="11" height="7.5" rx="1.5" />
                <path d="M7 9V6.5a3 3 0 0 1 6 0V9" strokeLinecap="round" />
              </svg>
              <div>
                <p className="font-body text-sm font-semibold">Secure checkout</p>
                <p className="mt-0.5 font-body text-xs text-cream/60">
                  Your details are only used for this order.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
