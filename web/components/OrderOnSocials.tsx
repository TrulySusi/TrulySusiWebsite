import { WhatsAppIcon, InstagramIcon } from "@/components/icons";

/**
 * The two ways to order while website checkout is switched off.
 *
 * WhatsApp is the primary action because it is the only one that can carry
 * the order across: wa.me pre-fills the message with the product and pack
 * size, so the conversation starts with us already knowing what they want.
 * Instagram opens a DM thread (ig.me/m/<handle>) but cannot pre-fill anything.
 *
 * Each button renders only when its URL is present — a missing `site_settings`
 * value shows nothing rather than a dead link.
 */
export function OrderOnSocials({
  whatsappUrl,
  instagramUrl,
  className = "",
}: {
  whatsappUrl: string | null;
  instagramUrl: string | null;
  className?: string;
}) {
  if (!whatsappUrl && !instagramUrl) return null;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2.5 rounded-full bg-navy px-6 py-4 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          <WhatsAppIcon className="h-4.5 w-4.5" />
          Order on WhatsApp
        </a>
      )}
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-navy px-6 py-3.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
        >
          <InstagramIcon className="h-4.5 w-4.5" />
          Order on Instagram
        </a>
      )}
    </div>
  );
}
