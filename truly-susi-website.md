# Truly Susi's — E-Commerce Website Plan

## Context

Truly Susi's is a homemade Tamil sweets brand (Badam Halwa, Mysore Pak, Thenkulal) run from Salem, Tamil Nadu, currently taking orders manually over WhatsApp with confirm-within-an-hour / ship-within-the-week turnaround. The brand already has a full identity system (logo, locked colour palette, brand strategy deck, an HTML prototype, and a running Instagram content calendar), but no real online storefront — customers can't browse, pay, or check out on their own, and there's no single place to see orders coming from the website, WhatsApp, and Instagram together. The goal is a proper e-commerce website plus the connective tissue (CRM, multi-channel order capture) needed to run the business without juggling three disconnected inboxes. The catalog is small today (3 SKUs) but is explicitly expected to grow, so nothing should be hardcoded around "3 products."

**Design intent**: the client shared [sweetkaramcoffee.in](https://sweetkaramcoffee.in) as a reference — it's a Shopify site with a busy, discount/urgency-driven UI (flash-sale badges, heavy emoji, "5 Lakh+ happy families" social proof). The brief was "explore as much as they have, we're a starting business and need to stand out with our looks/images/design/UI, but keep it basic." **Working interpretation**: borrow *structural* UX patterns from it (clear nav, benefit tags on product cards, delivery info placement, trust signals, PDP layout) but keep the *visual language* true to Truly Susi's own quieter, editorial navy/lilac/coral identity rather than adopting the discount-badge/emoji-heavy aesthetic — "basic" means restrained feature scope, not a plain/generic look. Flagging this explicitly so it can be corrected if the intent was different.

Decisions already made with the client:
- **Custom-coded build** (Next.js/React), not Shopify/Wix — keeps recurring cost well below Shopify's (~₹1,700–1,850/month fixed vs. Shopify's $21–39/month plus extra payment-gateway fees — see Cost overview), and gives full control to match the brand deck's editorial look.
- **Payments**: Razorpay only at launch (covers UPI/Google Pay/PhonePe/cards/netbanking through one integration). Cash on Delivery is deferred to a fast-follow phase, not part of v1 — the data model reserves a `cod` option so adding it later doesn't need a schema change.
- **Customer accounts**: optional login (email/password at launch; phone OTP deferred to a fast-follow phase to avoid the added SMS-provider cost/setup before there's real order volume) alongside guest checkout — requires a real customer database, not just a guest flow. Guest orders are still fully recorded (name/email/phone/address saved on the order itself) even without an account — see Section 5.
- **Private admin dashboard** required (owner manages orders + products themselves).
- **Multi-channel orders**: website, WhatsApp, and Instagram should all be trackable in one place. For now, WhatsApp/Instagram orders stay **fully manual** — the owner keeps chatting with customers exactly as today, and logs each order into the admin dashboard's "+ New order" form so it's tracked alongside website orders at no extra cost. Paid Meta Business API automation (catalog-in-chat, auto-replies) was considered but explicitly deferred indefinitely — the owner prefers in-person chat with customers over automation while the business is starting out; see Section 6.
- **Zoho CRM / Zoho Books**: wanted for tracking orders and financials, but explicitly as a **fast-follow after the core store is live**, not a launch blocker.
- **Fonts**: free Google Font substitutes — Cormorant Garamond (display) + Inter (body) — already validated in the existing prototype; architected so licensed fonts (Operetta 18 + Acumin Variable) can be swapped in later with a one-file change.
- **Content**: reuse the existing prototype's copy and product photography (`Claude/website/`) as real launch content rather than starting from scratch.
- **Domain**: `trulysusi.in`, already purchased.
- **Scope discipline**: no wishlist, loyalty/app-install prompts, corporate gifting, or international shipping for v1 — core shop + cart + checkout + account only.

## Brand foundations (confirmed from assets on disk)

- **Colors** (locked, from `TRULY SUSI'S FINAL LOGO/BRAND COLOURS.png`): Navy `#041C35`, Lilac `#EACAE8`, Coral Red `#E2372B`, Cream/Blush `#FDECE2`, Sage `#8AB284`.
- **Logo**: wordmark "Truly Susi's" (serif, dotted apostrophe) + arched-window "kuruvi" (bird) icon. Pre-exported in navy/beige/red/lilac/black-white/white-black variants under `TRULY SUSI'S FINAL LOGO/`. Source file: `Truly Susi's FINAL FINAL logo.ai`.
- **Voice**: warm, specific, never sentimental or "premium"-labeled; let photography carry the elevated feel (`Claude/_INSTAGRAM_RULES.md` / `00_LAUNCH_PLAN.md` tone notes).
- **Tagline**: "Sweeter together."
- **Existing seed content** to carry into the new build: `Claude/website/index.html` (hero copy, Meet Susi section, ordering steps, footer) and `Claude/website/assets/` (badam_halwa.jpg, mysore_pak.jpg, meet_susi.jpg, susi_hands.jpg, logo.png, etc). Thenkulal currently has no real product photo (placeholder in prototype) — flag this as a pre-launch content gap.
- **Compliance docs on file** (`Imp docs/GST Reg Certificate.pdf`, `Imp docs/AAHARA PAN.pdf`) — confirms GST invoicing and FSSAI/state food-license disclosure are real requirements, not speculative.

## 1. Site structure / pages

| Route | Purpose |
|---|---|
| `/` | Hero (logo + "Sweeter together"), 3 featured products, condensed brand promise/USP, "Meet Susi" teaser, Core Values tiles, Instagram strip |
| `/shop` | Product grid, pulled from DB (not hardcoded), category filter (hidden until >1 category exists) |
| `/shop/[slug]` | Full product detail page: gallery, weight/variant selector (250g today, room for 500g/1kg later), qty stepper, Add to Cart, ingredients + transparent-labeling block, shelf-life/storage + delivery-timeline note, related products |
| `/cart` | Editable line items, subtotal, shipping estimate, proceed to checkout |
| `/checkout` | Contact + address form (or pulled from saved address book if logged in), order summary, Razorpay payment, T&C/refund checkbox |
| `/order/confirmation/[order_number]` | Post-order summary + "we'll confirm on WhatsApp/email" |
| `/login`, `/signup` | Email/password; guest checkout remains available and is the default path |
| `/account` | Order history, saved addresses, profile — only reachable when logged in |
| `/about` | Full Susi's Story, Vision & Mission, expanded Core Values with editorial photography |
| `/contact` | Contact form, WhatsApp CTA, email, Instagram, delivery-area info |
| `/policies/*` | Shipping Policy, Refund/Cancellation Policy (perishable-goods specific), Privacy, Terms — **required by Razorpay before they'll activate live payments**, treat as a hard prerequisite |
| `/admin/*` | Private dashboard, see Section 4 |

Brand Promise / Core USP slide copy is not a standalone page — it's woven into Home (short form) and About (full narrative form), not dumped verbatim.

## 2. Data model (Supabase / Postgres)

```
categories        (id, slug, name, description, sort_order)
products          (id, slug, category_id?, name, short_description, description,
                    ingredients, allergen_info, shelf_life_days, status[draft/active/archived],
                    is_featured, sort_order)
product_variants  (id, product_id, label e.g. "250g box", weight_grams, sku,
                    price_inr, compare_at_price_inr?, stock_qty, is_default, is_active)
product_images    (id, product_id, storage_path, alt_text, sort_order)
customers         (id = auth.users.id, full_name, email, phone, created_at)   -- created on signup/login
addresses         (id, customer_id?, full_name, phone, line1, line2, city, state, pincode, is_default)
orders            (id, order_number unique e.g. TS-2026-000123, customer_id?, customer_name/email/phone,
                    shipping_address jsonb snapshot, subtotal_inr, shipping_fee_inr, discount_inr, total_inr,
                    payment_method[razorpay/cod], order_channel[website/whatsapp/instagram],
                    status[pending_payment/paid/packed/shipped/delivered/cancelled/refunded],
                    payment_status[pending/paid/failed/refunded], razorpay_order_id, gst_invoice_number?,
                    zoho_deal_id?, notes)
order_items       (id, order_id, product_id, variant_id, name_snapshot, variant_label_snapshot,
                    unit_price_inr, quantity, line_total_inr)
payments          (id, order_id, razorpay_order_id, razorpay_payment_id unique, razorpay_signature,
                    amount_inr, status, raw_payload jsonb, verified_at)   -- audit trail, idempotent on payment_id
admin_users       (id = auth.users.id, email, full_name, role[owner/staff])
site_settings     (key pk, value jsonb)   -- shipping rules, announcement banner, homepage tagline
contact_messages  (id, name, email, phone, message, handled bool)
```

**Contact form flow**: a `/contact` submission is saved to `contact_messages` (permanent record) **and** immediately triggers an email to the owner via Resend, so it lands in the inbox like any other message rather than requiring someone to remember to check the database. The `handled` flag is a lightweight admin-side checklist for anything that might slip through email — replies still happen directly over email/WhatsApp, not through the site.

`order_channel` + the manual-order path in the admin dashboard (Section 4) are what let WhatsApp/Instagram orders live in the same table as website orders, so admin reporting and the future Zoho sync don't need to know which channel an order came from. `zoho_deal_id` is included now (nullable, unused until Phase 6) so that phase doesn't require a schema migration.

**RLS**: public read-only on `categories`/`products`/`product_variants`/`product_images` where active; `customers`/`addresses` readable/writable only by their own `auth.uid()`; everything else (orders, payments, contact_messages) has no public access — all reads/writes go through server-side Route Handlers using the Supabase service-role key, or admin-authenticated queries. Checkout always re-fetches authoritative price/stock server-side — cart state (client-side, Zustand + localStorage) is never trusted for pricing.

## 3. Checkout & payment flow

1. Client cart (localStorage) → `POST /api/checkout/create-order` (server): re-validate stock/price from `product_variants`, compute total, insert `orders` (`pending_payment`, `order_channel='website'`) + `order_items`. If logged in, `customer_id` is attached and a saved address can prefill the form.
2. Create a Razorpay order server-side (`RAZORPAY_KEY_SECRET`, never exposed to client), return `razorpay_order_id` + public `key_id` to client. Client opens Razorpay Checkout.js, which natively presents UPI (Google Pay/PhonePe/etc.), cards, netbanking, and wallets as payment options — no separate integration needed per payment method. Theme color = brand navy `#041C35`.
3. On success, client posts `razorpay_payment_id/order_id/signature` to `/api/checkout/verify` — **server recomputes the HMAC-SHA256 signature and compares**; only a verified match marks the order `paid`, decrements stock, and triggers confirmation email. Client-reported "success" is never trusted alone.
4. **Webhook** (`POST /api/webhooks/razorpay`, verified via `RAZORPAY_WEBHOOK_SECRET`) is the source-of-truth backstop for the case where a customer pays but closes the tab before step 3 completes. Idempotent on `razorpay_payment_id`.
5. Redirect to `/order/confirmation/[order_number]`; send confirmation email (Resend).
6. **Cash on Delivery (fast-follow, not v1)**: when added later, this becomes a second path at step 2 — order created directly with `payment_status='pending'`, `payment_method='cod'`, no Razorpay call, owner confirms manually via the admin dashboard. Deferred per the client's preference to keep launch payment scope simple for a small business just starting out.

## 4. Admin dashboard

- `/admin/orders` — list/filter by status, date, payment method, **and channel** (website/WhatsApp/Instagram); view detail; update status (`packed`/`shipped`/`delivered`); mark `cancelled`/`refunded`; **"+ New order"** form to hand-log a WhatsApp/Instagram order into the same table (`order_channel` set accordingly) even before Phase 5's automation exists, and as a fallback afterward.
- `/admin/products` — create/edit products + variants (label/weight/price/stock), image upload to Supabase Storage, toggle draft/active, instant out-of-stock toggle.
- `/admin/categories` — simple CRUD, ready for catalog growth beyond sweets.
- `/admin/settings` — shipping fee rules, announcement banner, homepage tagline — JSON-backed, no code deploy needed for copy tweaks.
- `/admin/dashboard` — today's orders across all channels, revenue, low-stock alerts.
- **Security**: Supabase Auth (email/password) for the owner's account; every session is gated by membership in `admin_users` (checked in `middleware.ts` **and** again inside each server action — middleware alone isn't a hard boundary). All privileged writes use the service-role key, kept server-only (no `NEXT_PUBLIC_` prefix). `role` column future-proofs for adding staff later.

## 5. Customer accounts

- Supabase Auth with **email/password** at launch. Phone OTP is deferred to a fast-follow phase — it requires configuring and paying for a third-party SMS provider (e.g. MSG91 or Twilio), which isn't worth setting up before there's real order volume to justify it; adding it later doesn't require restructuring anything already built.
- On first login/signup, a `customers` row is created (`id` = `auth.users.id`). Guest checkout never creates one — only real signups do.
- **Guest orders are still fully recorded**: `orders` always stores `customer_name`/`customer_email`/`customer_phone`/`shipping_address` directly on the order itself, whether or not the buyer has an account. The difference an account makes is a standing profile that links *multiple* orders together automatically (via `customer_id`) and unlocks `/account` — without one, each guest order is a complete, independent record, just not pre-linked to past orders from the same person.
- `/account` shows order history (joined from `orders.customer_id`) and a saved address book (`addresses`), reusable at checkout.
- Guest checkout remains the default, unauthenticated path — login is additive, not required to buy. At checkout, guests see a light "sign in for faster checkout next time" prompt rather than login being hidden away in a separate area — but declining it never blocks the purchase.

## 6. Multi-channel orders (WhatsApp + Instagram) — manual, by choice

The owner explicitly prefers chatting with customers directly on WhatsApp/Instagram over setting up paid automation, especially while the business is just starting out. So for the foreseeable future:

- Orders keep coming in exactly as they do today — a normal WhatsApp or Instagram DM conversation, no bot, no catalog-in-chat, no auto-replies.
- The owner logs each of those orders into `/admin/orders` via the **"+ New order"** form (Section 4), tagging it with `order_channel='whatsapp'` or `'instagram'` — so it still shows up in the same unified order list and reporting as website orders, without any integration work or recurring cost.
- **Not currently planned**: the paid Meta Business API route (a BSP like Interakt/AiSensy, a synced Meta Commerce catalog, automatic order webhooks, ~₹3,000–5,000+/month) — this was explored and set aside. It's a reasonable thing to revisit later purely as a volume/time-saving decision if manual logging ever becomes the bottleneck, not because anything about the current approach is broken.

## 7. Zoho CRM / Books (fast-follow, post-launch)

- Recommended approach: **Zoho Flow** (no-code) watching for new `orders` rows (via a Supabase webhook/Edge Function) or Razorpay payment events, creating/updating a Contact + Deal in Zoho CRM and an invoice in Zoho Books — far less build effort than custom Zoho REST API code, and the owner can reconfigure the flow later without a developer.
- Requires an active Zoho CRM (and optionally Zoho Books) subscription — not yet confirmed to exist; this phase starts once that's in place.
- `orders.zoho_deal_id` is already reserved in the schema (Section 2) so this doesn't require a migration when it's built.

## 8. Tech stack

- **Next.js 14+ (App Router) + TypeScript**, **Tailwind CSS** with brand tokens (`navy`/`lilac`/`coral`/`cream`/`sage`) in `tailwind.config.ts`.
- **Fonts**: `next/font/google` — Cormorant Garamond (display) + Inter (body), wired through `font-display`/`font-body` Tailwind tokens so a later swap to licensed Operetta 18 + Acumin Variable (`next/font/local`) is a one-file change.
- **Supabase**: Postgres (schema above), Auth (customer email/password login + admin login), Storage (`product-images` bucket).
- **Razorpay**: Checkout.js + Orders API + Webhooks (Section 3). COD is a reserved-but-unbuilt option for v1 (see Section 3, item 6).
- **SMS/OTP provider**: MSG91 or Twilio — not needed at launch, added when phone OTP is built (Section 5).
- **WhatsApp/Instagram**: no API/BSP integration planned — manual chat + admin logging only (Section 6).
- **Zoho Flow**: no-code sync to Zoho CRM/Books (Section 7), fast-follow.
- **Deployment**: Vercel (native App Router/Route Handler/webhook support with fewer edge cases than Netlify for this stack).
- **Email**: Resend for order confirmations + low-stock/new-order alerts to the owner.
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (server-only), `RAZORPAY_WEBHOOK_SECRET` (server-only), `RESEND_API_KEY` (server-only), SMS provider keys (server-only), BSP API keys (server-only, added in Phase 5).

## 9. Build phasing

1. **Setup** — repo scaffold, Tailwind brand tokens, font loader, Supabase project + schema migration, logo assets imported.
2. **Brand shell, no commerce** — Home, About, Contact, `/shop` + `/shop/[slug]` reading real Supabase data seeded with the 3 real SKUs; Add to Cart disabled. Gets a reviewable, deployed site live fastest, reusing prototype copy/photos.
3. **Customer accounts** — Supabase Auth (email/password), `/login`, `/signup`, `/account` (order history once orders exist, address book).
4. **Cart + checkout** — cart state, `/cart`, `/checkout` (guest or logged-in), Razorpay create-order/verify/webhook, `/order/confirmation/[order_number]`, transactional email. Test extensively in Razorpay test mode, including the "browser closed after payment" webhook path, before going live.
5. **Admin dashboard** — Supabase Auth login, `admin_users` gating, orders list/detail/status + manual "+ New order" entry with channel tagging (this is how WhatsApp/Instagram orders get tracked, per Section 6 — no separate automation phase needed), product/variant CRUD with image upload, settings page.
6. **Zoho CRM/Books sync** — Zoho Flow automation, once a Zoho subscription is confirmed.
7. **Cash on Delivery + Phone OTP login** — add the COD path at checkout + admin confirmation step, and phone-OTP login (with an SMS provider wired up), once launch volume justifies the added cost/complexity of each.
8. **Polish** — legal/policy pages (blocking for Razorpay live activation), SEO metadata/sitemap/OG images, GST invoice generation, FSSAI number in footer, accessibility pass, performance, licensed-font swap if/when purchased.
9. **Future** — categories beyond sweets, discount codes, reviews/UGC, wishlist/loyalty, corporate gifting, international shipping, and revisiting paid WhatsApp/Instagram automation if manual logging ever becomes a real bottleneck (explicitly deferred/optional per Section "Scope discipline" and Section 6).

## Cost overview

One correction to the earlier framing: Vercel's free "Hobby" tier is explicitly **personal/non-commercial only** per its terms — a real business running on it would be against Vercel's ToS. The honest v1 budget assumes **Vercel Pro**, not free hosting.

**At launch (v1), fixed monthly cost:**

| Item | Cost |
|---|---|
| Vercel Pro (hosting) | $20/mo (~₹1,700/mo) |
| Supabase (database/auth/storage) | ₹0 — free tier (500MB DB, 50K monthly active users, 1GB storage) comfortably covers this scale |
| Resend (order emails) | ₹0 — free tier covers 3,000 emails/month |
| Google Fonts | ₹0 |
| Domain renewal | already purchased; ~₹800–1,500/year going forward (not a new cost) |
| **Fixed total** | **~₹1,700–1,850/month** |

**Plus a variable cost tied to sales, not fixed:**
- Razorpay: no monthly fee, ~2% transaction fee per payment (e.g. ~₹10 on a ₹500 order) — scales with revenue, not charged when there are no sales.

**Not needed at launch — added only in their respective fast-follow phases:**

| Item | When | Est. cost |
|---|---|---|
| Zoho CRM | Phase 7 | Free plan covers up to 3 users — likely ₹0 for a solo owner |
| Zoho Books | Phase 7 | Free if annual turnover is under ₹25 lakh (likely true early on) — ₹0 until then, ₹899+/mo (+18% GST) after |
| Phone OTP SMS (MSG91/Twilio) | Phase 8 | Pay-per-SMS, roughly ₹0.15–0.20/OTP — small, scales with login volume |
| WhatsApp/Instagram BSP + Meta fees | Not currently planned (Section 6) | ~₹3,000–5,000+/month if ever revisited — the single biggest potential recurring cost in the whole roadmap, which is exactly why it's being skipped for now |

**Bottom line**: launching the core store costs roughly **₹1,700–1,850/month plus ~2% of sales** — well below Shopify's $21–39/month *plus* extra payment-gateway fees. The CRM side (Zoho) may end up free at your current scale, and WhatsApp/Instagram order tracking stays free indefinitely by staying manual.

## Open items to resolve before/during build (non-blocking, flagged for the owner)

- Real product photo for Thenkulal (currently a placeholder in the prototype).
- Exact per-variant pricing (prototype has `₹___` placeholders) and whether to launch with 250g only or add 500g/1kg variants immediately.
- Shipping fee logic (flat rate vs. weight/zone-based) and any minimum order value.
- GSTIN and FSSAI/state license number for footer + invoice generation (docs exist in `Imp docs/`, just need the numbers transcribed).
- Real WhatsApp Business number (needed for the site's click-to-chat links).
- Confirmation of Zoho CRM/Books subscription status, once Phase 6 is reached.
- Confirm the "design intent" reading in the Context section (structural inspiration from Sweet Karam Coffee, not its visual/discount-driven language) is correct.

## Verification

- Local dev: run the Next.js app, walk the full guest flow and the logged-in flow (phone OTP and email/password) — browse → add to cart → checkout with Razorpay test keys → webhook fires via Razorpay CLI/ngrok → order shows `paid` in admin.
- Confirm RLS policies block anonymous reads/writes on `orders`/`payments`/`customers` directly via the Supabase client (e.g. via the Supabase SQL editor's "run as anon" check), and that a logged-in customer can only see their own `orders`/`addresses`.
- Cross-browser/responsive check (mobile is the primary channel given the WhatsApp-first customer base today).
- Before flipping Razorpay to live mode: confirm policy pages are published and Razorpay KYC/activation requirements are met.
