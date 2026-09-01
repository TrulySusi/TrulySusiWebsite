import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = { title: "Privacy Policy · Truly Susi's" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 sm:px-10">
      <Breadcrumb items={[{ label: "Privacy Policy" }]} />
      <h1 className="mt-8 font-display text-4xl text-navy">Privacy Policy</h1>
      <p className="mt-3 font-body text-sm text-navy/50">Last updated 21 August 2026</p>

      <div className="mt-8 space-y-8 font-body text-[15px] leading-relaxed text-navy/70">
        <section>
          <p>
            This Privacy Policy explains what information{" "}
            <strong className="text-navy">Aahara Heritage LLP</strong>, trading as{" "}
            <strong className="text-navy">Truly Susi&rsquo;s</strong>, collects through
            www.trulysusi.in, and how we use it. We collect only what we need to take and deliver
            your order.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Information we collect</h2>
          <p className="mt-3">When you place an order, we collect:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Your name and phone number (and an alternate number, if you provide one)</li>
            <li>Your delivery address</li>
            <li>Your email address, if you choose to create an account to log in</li>
            <li>Details of what you ordered</li>
          </ul>
          <p className="mt-3">
            We don&rsquo;t collect or store your card or payment details ourselves. That
            will be handled directly by our payment provider once online payment is live.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">How we use it</h2>
          <p className="mt-3">
            We use your information to prepare, confirm, and deliver your order, and to contact
            you about it (currently over WhatsApp or email, since online order tracking
            isn&rsquo;t live yet). We don&rsquo;t use your information for anything beyond running
            your order and responding to enquiries you send us.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Cookies &amp; local storage</h2>
          <p className="mt-3">
            Your cart contents are saved in your browser&rsquo;s local storage so it&rsquo;s still
            there if you come back later. This stays on your device and isn&rsquo;t sent to
            us until you check out. If you log in, a session cookie keeps you signed in. We do not
            currently use any third-party analytics or advertising cookies to track you across the
            Site.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">How we share your information</h2>
          <p className="mt-3">
            Your order information is stored with Supabase, our database and hosting provider, who
            process it on our behalf. Once online payment goes live, order and payment details
            relevant to completing a transaction will also be shared with our payment processor.
            We do not sell your personal information to anyone.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Data security</h2>
          <p className="mt-3">
            We take reasonable steps to protect your information, but no method of storage or
            transmission over the internet is completely secure, and we can&rsquo;t guarantee
            absolute security.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Your rights</h2>
          <p className="mt-3">
            You can ask us what information we hold about you, ask us to correct it, or ask us to
            delete your account and associated data, by writing to{" "}
            <a href="mailto:feedback@trulysusi.in" className="text-brass hover:text-navy">
              feedback@trulysusi.in
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Data retention</h2>
          <p className="mt-3">
            We keep your information for as long as needed to fulfil your order, respond to any
            related queries, and meet our legal and accounting obligations.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Children&rsquo;s privacy</h2>
          <p className="mt-3">
            The Site isn&rsquo;t directed at children, and we don&rsquo;t knowingly collect
            personal information from anyone under 18.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Changes to this policy</h2>
          <p className="mt-3">
            We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo;
            date at the top of this page reflects the most recent revision.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy">Contact</h2>
          <p className="mt-3">
            Questions about this policy or your data? Write to us at{" "}
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
