import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DocumentScrollbar } from "@/components/DocumentScrollbar";
import { ReviewsWidget } from "@/components/ReviewsWidget";
import { ReviewsWidgetProvider } from "@/components/ReviewsWidgetContext";
import { CartWidget } from "@/components/CartWidget";
import { OrderingProvider } from "@/components/OrderingContext";
import { OrderingNotice } from "@/components/OrderingNotice";
import { getSiteSettings } from "@/lib/site-settings";
import "overlayscrollbars/overlayscrollbars.css";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <ReviewsWidgetProvider>
      <OrderingProvider value={settings.ordering}>
        <DocumentScrollbar />
        <OrderingNotice notice={settings.ordering.notice} />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter fssaiLicenceNo={settings.fssaiLicenceNo} customerCarePhone={settings.customerCarePhone} />
        <ReviewsWidget />
        <CartWidget />
      </OrderingProvider>
    </ReviewsWidgetProvider>
  );
}
