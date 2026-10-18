import { getSiteSettings } from "@/lib/site-settings";
import { OrderingClosed } from "@/components/OrderingClosed";

/**
 * Server-side guard. cart/page.tsx is a Client Component and cannot block
 * itself, so the gate lives here: with ordering switched off the real page is
 * never rendered or sent to the browser, which is what makes pasting the URL
 * directly fail rather than just hiding the buttons that lead here.
 */
export default async function CartLayout({ children }: { children: React.ReactNode }) {
  const { ordering } = await getSiteSettings();
  if (!ordering.enabled) return <OrderingClosed ordering={ordering} />;
  return <>{children}</>;
}
