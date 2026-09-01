import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = { title: "Terms & Conditions · Truly Susi's" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 sm:px-10">
      <Breadcrumb items={[{ label: "Terms & Conditions" }]} />
      <h1 className="mt-8 font-display text-4xl text-navy">Terms &amp; Conditions</h1>
      <p className="mt-3 font-body text-sm text-navy/50">Last updated 21 August 2026</p>

      <div className="mt-8 space-y-8 font-body text-[15px] leading-relaxed text-navy/70">
        <section>
          <p>
            This website, www.trulysusi.in (&ldquo;the Site&rdquo;), is owned and operated by{" "}
            <strong className="text-navy">Aahara Heritage LLP</strong>, trading as{" "}
            <strong className="text-navy">Truly Susi&rsquo;s</strong>. By accessing the Site or
            placing an order, you agree to be bound by these Terms &amp; Conditions. If you do
            not agree with any part of these terms, please do not use the Site.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">1. Eligibility</h2>
          <p className="mt-3">
            You must be able to form a legally binding contract under Indian law to place an
            order on the Site. By ordering, you confirm that the information you provide is
            accurate and that you are authorised to use the payment method associated with your
            order.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">2. Products &amp; Pricing</h2>
          <p className="mt-3">
            All prices on the Site are listed in Indian Rupees (₹). Prices, product availability,
            and product descriptions are subject to change without notice. Since our sweets are
            handmade in small batches, the exact appearance of a product may vary slightly from
            its photograph on the Site this is a natural part of anything made by hand,
            not a defect.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">3. Orders &amp; Payment</h2>
          <p className="mt-3">
            An order is confirmed once payment has been accepted. We reserve the right to refuse,
            limit, or cancel any order , for example, if a product is out of stock, if we
            suspect fraud, or if there has been a pricing error - and will notify you and
            issue a full refund if this happens.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">4. Shipping &amp; Delivery</h2>
          <p className="mt-3">
            Shipping charges, delivery timelines, and our returns &amp; refund process for
            perishable products are covered in our{" "}
            <Link href="/policies/shipping" className="text-brass hover:text-navy">
              Shipping &amp; Delivery Policy
            </Link>
            , which forms part of these Terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">5. Intellectual Property</h2>
          <p className="mt-3">
            The Truly Susi&rsquo;s name, the Kuruvi mark, our logo, product photography, and all
            other content on the Site are the property of Aahara Heritage LLP and may not be
            reproduced, copied, or used without our prior written permission.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">6. Limitation of Liability</h2>
          <p className="mt-3">
            We make every effort to ensure the information on this Site is accurate, but we do
            not guarantee it is complete or error-free. To the extent permitted by law, Aahara
            Heritage LLP is not liable for any indirect or consequential loss arising from your
            use of the Site.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">7. Governing Law</h2>
          <p className="mt-3">
            These Terms are governed by the laws of India. Any disputes arising from your use of
            the Site or your order will be subject to the jurisdiction of the courts in Salem,
            Tamil Nadu.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">8. Changes to These Terms</h2>
          <p className="mt-3">
            We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at
            the top of this page will reflect the most recent revision. Continued use of the Site
            after a change means you accept the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Contact</h2>
          <p className="mt-3">
            Questions about these Terms? Write to us at{" "}
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
