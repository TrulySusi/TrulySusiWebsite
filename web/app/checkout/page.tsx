"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cartCount, cartSubtotal, useCartStore } from "@/lib/cart-store";
import {
  emptyDelivery,
  useCheckoutStore,
  type AddressLabel,
  type DeliveryDetails,
} from "@/lib/checkout-store";
import { createClient } from "@/lib/supabase/client";
import { INDIA_STATES, lookupPincode } from "@/lib/india";

const ADDRESS_LABELS: AddressLabel[] = ["Home", "Work", "Other"];

// Same dummy figures as /policies/shipping — explicitly user-authorized
// placeholders pending real numbers, not fabricated on the spot.
const FREE_SHIPPING_THRESHOLD = 999;
const FLAT_SHIPPING_FEE = 79;

const fieldClass =
  "rounded-lg border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20";

function errorFieldClass(hasError: boolean) {
  return `rounded-lg border bg-white px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 ${
    hasError ? "border-brass focus:ring-brass/40" : "border-navy/15 focus:ring-navy/20"
  }`;
}

type BillingAddress = {
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

const emptyBilling: BillingAddress = {
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

type SavedAddress = DeliveryDetails & { id: string };

function rowToDeliveryDetails(row: {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  alternate_phone: string | null;
  label: string | null;
  line1: string | null;
  line2: string | null;
  landmark: string | null;
  pincode: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
}): DeliveryDetails {
  return {
    email: "",
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    phone: row.phone ?? "",
    alternatePhone: row.alternate_phone ?? "",
    label: (row.label as AddressLabel) ?? "Home",
    line1: row.line1 ?? "",
    line2: row.line2 ?? "",
    landmark: row.landmark ?? "",
    pincode: row.pincode ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    notes: row.notes ?? "",
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const delivery = useCheckoutStore((s) => s.delivery);
  const setDelivery = useCheckoutStore((s) => s.setDelivery);
  const clearCheckoutDraft = useCheckoutStore((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ---- session ----
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedInEmail(data.user?.email ?? null);
      setSessionChecked(true);
    });
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    clearCheckoutDraft();
    setSavedAddresses([]);
    setSelectedAddressId(null);
    setLoadedSaved(false);
    setLoggedInEmail(null);
    setLoggingOut(false);
  }

  // ---- contact / sign-in ----
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInPassword, setSignInPassword] = useState("");
  const [signInSubmitting, setSignInSubmitting] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [resetting, setResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // ---- delivery form ----
  const [form, setForm] = useState<DeliveryDetails>(emptyDelivery);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadedSaved, setLoadedSaved] = useState(false);

  const [saveAddress, setSaveAddress] = useState(true);

  // ---- billing address ----
  const [billingSame, setBillingSame] = useState(true);
  const [billingForm, setBillingForm] = useState<BillingAddress>(emptyBilling);

  // ---- discount code ----
  const [discountCode, setDiscountCode] = useState("");
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) {
      router.replace("/cart");
      return;
    }
    setForm(delivery);
  }, [mounted, items.length, router, delivery]);

  useEffect(() => {
    if (!mounted || delivery.firstName) return;

    async function loadSavedAddresses() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rows } = await supabase
        .from("addresses")
        .select("*")
        .eq("customer_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      if (!rows || rows.length === 0) return;

      const all: SavedAddress[] = rows.map((row) => ({
        id: row.id,
        ...rowToDeliveryDetails(row),
      }));
      setSavedAddresses(all);

      const defaultAddress = all[0];
      setForm((f) => ({ ...defaultAddress, email: f.email }));
      setSelectedAddressId(defaultAddress.id);
      setLoadedSaved(true);
    }

    loadSavedAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    if (loggedInEmail && !form.email) {
      setForm((f) => ({ ...f, email: loggedInEmail }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInEmail]);

  if (!mounted || items.length === 0 || !sessionChecked) return null;

  function selectSavedAddress(addr: SavedAddress) {
    setForm((f) => ({ ...addr, email: f.email }));
    setSelectedAddressId(addr.id);
  }

  function selectNewAddress() {
    setForm((f) => ({ ...emptyDelivery, email: f.email }));
    setSelectedAddressId(null);
  }

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

  function updateBilling<K extends keyof BillingAddress>(field: K, value: BillingAddress[K]) {
    setBillingForm((f) => ({ ...f, [field]: value }));
  }

  function handleApplyDiscount() {
    if (!discountCode.trim()) {
      setDiscountError("Enter a code first.");
      setDiscountMessage(null);
      return;
    }
    setDiscountError(null);
    setDiscountMessage("Discount codes aren't available yet.");
  }

  async function handleSignIn() {
    setSignInError(null);
    const errors: typeof fieldErrors = {};
    if (!form.email.trim()) errors.email = "Enter your email.";
    else if (!isValidEmail(form.email)) errors.email = "Enter a valid email address.";
    if (!signInPassword) errors.password = "Enter your password.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSignInSubmitting(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: signInPassword,
    });

    if (authError || !data.user) {
      setSignInError(authError?.message ?? "Couldn't log in. Please try again.");
      setSignInSubmitting(false);
      return;
    }

    await supabase
      .from("customers")
      .upsert({ id: data.user.id, email: data.user.email }, { onConflict: "id" });

    clearCheckoutDraft();
    setLoggedInEmail(data.user.email ?? form.email);
    setShowSignIn(false);
    setSignInPassword("");
    setSignInSubmitting(false);
  }

  async function handleForgotPassword() {
    setResetError(null);
    setResetSent(false);
    if (!form.email.trim() || !isValidEmail(form.email)) {
      setFieldErrors((f) => ({ ...f, email: "Enter your email above, then tap Forgot password." }));
      return;
    }

    setResetting(true);
    const supabase = createClient();
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/account/reset-password`,
    });
    setResetting(false);

    if (resetErr) {
      setResetError(resetErr.message);
      return;
    }
    setResetSent(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.email.trim() || !isValidEmail(form.email)) {
      setFieldErrors((f) => ({ ...f, email: "Enter a valid email address." }));
      setError("Please add a valid contact email.");
      return;
    }

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

    setSubmitting(true);
    setDelivery(form);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && saveAddress) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("customer_id", user.id);

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

      if (selectedAddressId) {
        await supabase.from("addresses").update(row).eq("id", selectedAddressId);
      } else {
        await supabase.from("addresses").insert(row);
      }
    }

    setSubmitting(false);
    setSaved(true);
  }

  const subtotal = cartSubtotal(items);
  const addressComplete =
    form.pincode.trim().length === 6 && form.city.trim().length > 0 && form.state.trim().length > 0;
  const shippingFee = addressComplete ? (subtotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE) : null;
  const total = subtotal + (shippingFee ?? 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <h1 className="font-display text-4xl text-navy">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px]"
      >
        <div className="flex flex-col gap-6">
          {/* Contact */}
          <section className="rounded-2xl border border-navy/10 bg-white p-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass/15 text-brass">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
                    <circle cx="10" cy="7" r="3" />
                    <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="font-display text-2xl text-navy">Contact</h2>
              </div>
              {loggedInEmail ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="font-body text-xs text-navy/50 hover:text-brass disabled:opacity-60"
                >
                  {loggingOut ? "Logging out…" : "Log out"}
                </button>
              ) : (
                !showSignIn && (
                  <button
                    type="button"
                    onClick={() => setShowSignIn(true)}
                    className="font-body text-xs font-semibold text-brass hover:text-navy"
                  >
                    Sign in
                  </button>
                )
              )}
            </div>

            {loggedInEmail ? (
              <p className="mt-3 font-body text-sm text-navy/70">
                Signed in as <span className="font-semibold text-navy">{loggedInEmail}</span>
              </p>
            ) : (
              <div className="mt-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => {
                    update("email", e.target.value);
                    setFieldErrors((f) => ({ ...f, email: undefined }));
                  }}
                  className={`w-full ${errorFieldClass(!!fieldErrors.email)}`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 font-body text-xs text-brass">{fieldErrors.email}</p>
                )}

                {showSignIn && (
                  <div className="mt-3 flex flex-col gap-3">
                    <input
                      type="password"
                      placeholder="Password"
                      value={signInPassword}
                      onChange={(e) => {
                        setSignInPassword(e.target.value);
                        setFieldErrors((f) => ({ ...f, password: undefined }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSignIn();
                        }
                      }}
                      className={`w-full ${errorFieldClass(!!fieldErrors.password)}`}
                    />
                    {fieldErrors.password && (
                      <p className="font-body text-xs text-brass">{fieldErrors.password}</p>
                    )}

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetting}
                      className="self-end font-body text-xs text-navy/50 hover:text-brass disabled:opacity-60"
                    >
                      {resetting ? "Sending…" : "Forgot password?"}
                    </button>
                    {resetSent && (
                      <p className="font-body text-xs text-sage">Check your email for a reset link.</p>
                    )}
                    {resetError && <p className="font-body text-xs text-brass">{resetError}</p>}
                    {signInError && <p className="font-body text-xs text-brass">{signInError}</p>}

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleSignIn}
                        disabled={signInSubmitting}
                        className="rounded-full bg-navy px-5 py-2.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
                      >
                        {signInSubmitting ? "Signing in…" : "Sign in"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSignIn(false);
                          setSignInPassword("");
                          setSignInError(null);
                        }}
                        className="font-body text-sm text-navy/50 hover:text-navy"
                      >
                        Cancel
                      </button>
                    </div>
                    <Link
                      href="/account/signup"
                      className="font-body text-xs text-navy/50 hover:text-brass"
                    >
                      New here? Create an account
                    </Link>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Delivery */}
          <section className="rounded-2xl border border-navy/10 bg-white p-7">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass/15 text-brass">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
                  <path d="M10 17.5s6-4.35 6-9.15A6 6 0 0 0 4 8.35C4 13.15 10 17.5 10 17.5Z" strokeLinejoin="round" />
                  <circle cx="10" cy="8" r="2" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-navy">Delivery</h2>
            </div>
            {loadedSaved && (
              <p className="mt-2 font-body text-xs text-sage">
                Loaded your saved address — edit anything that&rsquo;s changed.
              </p>
            )}

            {savedAddresses.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => selectSavedAddress(addr)}
                    aria-pressed={selectedAddressId === addr.id}
                    className={`rounded-xl border px-3.5 py-2 text-left font-body text-xs transition-colors ${
                      selectedAddressId === addr.id
                        ? "border-navy bg-navy text-cream"
                        : "border-navy/15 bg-cream text-navy hover:border-navy/30"
                    }`}
                  >
                    <span className="block font-semibold">{addr.label}</span>
                    <span
                      className={`block ${selectedAddressId === addr.id ? "text-cream/70" : "text-navy/60"}`}
                    >
                      {addr.line1}, {addr.city}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={selectNewAddress}
                  aria-pressed={selectedAddressId === null}
                  className={`rounded-xl border px-3.5 py-2 font-body text-xs font-semibold transition-colors ${
                    selectedAddressId === null
                      ? "border-navy bg-navy text-cream"
                      : "border-dashed border-navy/25 text-navy hover:border-navy/40"
                  }`}
                >
                  + Add new address
                </button>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
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

            <label className="mt-4 flex items-center gap-2.5 font-body text-sm text-navy/70">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4 rounded border-navy/30 text-navy focus:ring-1 focus:ring-navy/20"
              />
              Save this information for next time
            </label>
          </section>

          {/* Shipping method */}
          <section className="rounded-2xl border border-navy/10 bg-white p-7">
            <h2 className="font-display text-2xl text-navy">Shipping method</h2>
            {addressComplete ? (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-navy bg-navy/5 px-4 py-3">
                <span className="font-body text-sm text-navy">Standard shipping</span>
                <span className="font-body text-sm font-bold text-navy">
                  {shippingFee === 0 ? "Free" : `₹${shippingFee}`}
                </span>
              </div>
            ) : (
              <p className="mt-4 rounded-lg bg-navy/5 px-4 py-3 font-body text-sm text-navy/50">
                Enter your delivery address to see shipping options.
              </p>
            )}
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-navy/10 bg-white p-7">
            <h2 className="font-display text-2xl text-navy">Payment</h2>
            <p className="mt-1 font-body text-xs text-navy/50">
              All transactions are secure and encrypted.
            </p>

            <div className="mt-4 rounded-lg border border-navy/15 px-4 py-3 opacity-60">
              <p className="font-body text-sm font-semibold text-navy">
                Razorpay Secure (UPI, Card, NetBanking, Wallets)
              </p>
              <p className="mt-1 font-body text-xs text-navy/50">
                Coming soon — online payment isn&rsquo;t live yet.
              </p>
            </div>

            {saved && (
              <p className="mt-4 rounded-lg bg-sage/10 px-4 py-3 font-body text-sm text-navy">
                Your details are saved. We&rsquo;ll open online payment here as soon as it&rsquo;s
                live — no need to redo anything.
              </p>
            )}
          </section>

          {/* Billing address */}
          <section className="rounded-2xl border border-navy/10 bg-white p-7">
            <h2 className="font-display text-2xl text-navy">Billing address</h2>

            <div className="mt-4 flex flex-col gap-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 font-body text-sm text-navy transition-colors ${
                  billingSame ? "border-navy bg-navy/5" : "border-navy/15"
                }`}
              >
                <input
                  type="radio"
                  name="billing-address"
                  checked={billingSame}
                  onChange={() => setBillingSame(true)}
                  className="h-4 w-4 text-navy focus:ring-1 focus:ring-navy/20"
                />
                Same as shipping address
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 font-body text-sm text-navy transition-colors ${
                  !billingSame ? "border-navy bg-navy/5" : "border-navy/15"
                }`}
              >
                <input
                  type="radio"
                  name="billing-address"
                  checked={!billingSame}
                  onChange={() => setBillingSame(false)}
                  className="h-4 w-4 text-navy focus:ring-1 focus:ring-navy/20"
                />
                Use a different billing address
              </label>
            </div>

            {!billingSame && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  placeholder="First name"
                  value={billingForm.firstName}
                  onChange={(e) => updateBilling("firstName", e.target.value)}
                  className={fieldClass}
                />
                <input
                  placeholder="Last name"
                  value={billingForm.lastName}
                  onChange={(e) => updateBilling("lastName", e.target.value)}
                  className={fieldClass}
                />
                <input
                  placeholder="House / Flat / Building no."
                  value={billingForm.line1}
                  onChange={(e) => updateBilling("line1", e.target.value)}
                  className={`sm:col-span-2 ${fieldClass}`}
                />
                <input
                  placeholder="Street / Area / Locality"
                  value={billingForm.line2}
                  onChange={(e) => updateBilling("line2", e.target.value)}
                  className={`sm:col-span-2 ${fieldClass}`}
                />
                <input
                  placeholder="Pincode"
                  inputMode="numeric"
                  value={billingForm.pincode}
                  onChange={(e) => updateBilling("pincode", e.target.value)}
                  className={fieldClass}
                />
                <input
                  placeholder="City"
                  value={billingForm.city}
                  onChange={(e) => updateBilling("city", e.target.value)}
                  className={fieldClass}
                />
                <select
                  value={billingForm.state}
                  onChange={(e) => updateBilling("state", e.target.value)}
                  className={`sm:col-span-2 ${fieldClass} ${billingForm.state ? "text-navy" : "text-navy/40"}`}
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
              </div>
            )}
          </section>

          {error && <p className="font-body text-sm text-brass">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? "Processing…" : saved ? "Details saved ✓" : "Pay now"}
          </button>
        </div>

        {/* Order summary */}
        <div className="sticky top-24 rounded-2xl bg-navy p-6 text-cream">
          <h2 className="font-display text-xl text-cream">Order summary</h2>

          <div className="mt-5 flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.variantId} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream/10">
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brass font-body text-[10px] font-bold text-navy">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-medium text-cream">
                    {item.productName}
                  </p>
                  <p className="font-body text-xs text-cream/55">{item.variantLabel}</p>
                </div>
                <span className="shrink-0 font-body text-sm font-bold text-cream">
                  ₹{(item.priceInr * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <input
              placeholder="Discount code"
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value);
                setDiscountMessage(null);
                setDiscountError(null);
              }}
              className="min-w-0 flex-1 rounded-lg border border-transparent bg-white px-3 py-2.5 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-brass/60"
            />
            <button
              type="button"
              onClick={handleApplyDiscount}
              className="shrink-0 rounded-lg bg-brass px-4 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-brass/90"
            >
              Apply
            </button>
          </div>
          {discountError && (
            <p className="mt-1.5 font-body text-xs text-red-400">{discountError}</p>
          )}
          {discountMessage && (
            <p className="mt-1.5 font-body text-xs text-cream/55">{discountMessage}</p>
          )}

          <div className="mt-5 space-y-2 border-t border-cream/15 pt-5 font-body text-sm">
            <div className="flex justify-between">
              <span className="text-cream/70">
                Subtotal ({cartCount(items)} item{cartCount(items) === 1 ? "" : "s"})
              </span>
              <span className="font-bold text-cream">₹{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream/70">Shipping</span>
              <span className={shippingFee === null ? "text-cream/50" : "font-bold text-cream"}>
                {shippingFee === null ? "Enter address" : shippingFee === 0 ? "Free" : `₹${shippingFee}`}
              </span>
            </div>
            <div className="flex justify-between border-t border-cream/15 pt-2 text-base">
              <span className="font-semibold text-cream">Total</span>
              <span className="font-bold text-cream">
                <span className="mr-1 font-body text-[10px] font-normal uppercase text-cream/50">
                  INR
                </span>
                ₹{total.toFixed(0)}
              </span>
            </div>
            <p className="text-right font-body text-[11px] text-cream/45">Inclusive of all taxes</p>
          </div>
        </div>
      </form>
    </main>
  );
}
