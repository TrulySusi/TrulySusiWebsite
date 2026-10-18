import Link from "next/link";
import { OrderOnSocials } from "@/components/OrderOnSocials";
import type { Ordering } from "@/lib/ordering";

/**
 * Shown in place of /cart and /checkout while website ordering is off.
 *
 * Rendered from those routes' server layouts rather than from the pages
 * themselves (which are Client Components), so typing the URL directly can't
 * reach a checkout that cannot take money. Hiding the buttons alone would not
 * be a block.
 */
export function OrderingClosed({ ordering }: { ordering: Ordering }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center sm:px-10">
      <h1 className="font-display text-4xl text-navy">
        We&rsquo;re taking orders on WhatsApp &amp; Instagram
      </h1>
      <p className="mt-4 font-body text-navy/60 text-center!">
        Online checkout is opening soon. Message us with what you&rsquo;d like and
        we&rsquo;ll confirm your total and delivery.
      </p>

      <OrderOnSocials
        className="mx-auto mt-8 max-w-xs"
        whatsappUrl={ordering.whatsappUrl}
        instagramUrl={ordering.instagramUrl}
      />

      <Link
        href="/shop"
        className="mt-8 inline-block font-body text-sm font-semibold text-brass transition-colors hover:text-navy"
      >
        Back to the products &rarr;
      </Link>
    </main>
  );
}
