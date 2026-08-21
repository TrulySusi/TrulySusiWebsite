import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping & Delivery · Truly Susi's" };

export default function ShippingPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 sm:px-10">
      <h1 className="font-display text-4xl text-navy">Shipping &amp; Delivery</h1>
      <p className="mt-3 font-body text-sm text-navy/50">Last updated 21 August 2026</p>

      <div className="mt-8 space-y-8 font-body text-[15px] leading-relaxed text-navy/70">
        <section>
          <h2 className="font-display text-2xl text-navy">Where we deliver</h2>
          <p className="mt-3">
            We&rsquo;re based in Salem, Tamil Nadu, and ship our sweets across India.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Shipping charges</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Free shipping on prepaid orders above ₹999.</li>
            <li>A flat shipping fee of ₹79 applies to orders below ₹999.</li>
            <li>The exact shipping fee for your order is always shown at checkout before you pay.</li>
          </ul>
          <p className="mt-3 text-navy/50 text-sm">
            These figures are indicative and may be revised as we finalise our courier
            arrangements &mdash; the checkout page is the source of truth for what you&rsquo;ll
            actually be charged.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Order processing</h2>
          <p className="mt-3">
            Nothing sits on a shelf waiting for an order &mdash; each box is packed fresh once you
            place it. Orders are typically dispatched within 1&ndash;2 business days of
            confirmation.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Delivery timelines</h2>
          <p className="mt-3">
            Once dispatched, delivery typically takes 3&ndash;7 business days depending on your
            location, via our courier partner. Deliveries within Tamil Nadu are generally faster
            than the rest of India. Delays can occasionally happen due to courier disruptions,
            festive-season volume, or weather &mdash; we&rsquo;ll keep you updated if that
            happens.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Order tracking</h2>
          <p className="mt-3">
            Online order tracking isn&rsquo;t live on the Site yet. Until it is, we&rsquo;ll
            confirm and update you on your order directly over WhatsApp or email.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Address &amp; contact details</h2>
          <p className="mt-3">
            Please double-check your delivery address and phone number at checkout. If you spot a
            mistake, write to us at{" "}
            <a href="mailto:feedback@trulysusi.in" className="text-brass hover:text-navy">
              feedback@trulysusi.in
            </a>{" "}
            as soon as possible &mdash; we can usually correct it before your order is
            dispatched, but not after.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">
            Damaged, missing, or incorrect items
          </h2>
          <p className="mt-3">
            If something arrives damaged, incomplete, or different from what you ordered, please
            email us within 48 hours of delivery with a photo of what you received and your order
            number. We&rsquo;ll arrange a replacement or refund once we&rsquo;ve verified the
            issue.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Returns &amp; refunds</h2>
          <p className="mt-3">
            Because our sweets are handmade, perishable, and made fresh to order, we&rsquo;re
            unable to accept returns for change of mind. Replacements or refunds are only offered
            for items that arrive damaged, spoiled, or incorrect, reported as above.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Cancellations</h2>
          <p className="mt-3">
            You can cancel an order within 2 hours of placing it, before it goes into production,
            by emailing{" "}
            <a href="mailto:feedback@trulysusi.in" className="text-brass hover:text-navy">
              feedback@trulysusi.in
            </a>
            . Once your sweets are being made, we&rsquo;re usually not able to cancel the order.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Contact</h2>
          <p className="mt-3">
            For anything shipping-related, write to us at{" "}
            <a href="mailto:feedback@trulysusi.in" className="text-brass hover:text-navy">
              feedback@trulysusi.in
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
