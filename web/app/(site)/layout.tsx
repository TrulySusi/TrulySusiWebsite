import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DocumentScrollbar } from "@/components/DocumentScrollbar";
import { ReviewsWidget } from "@/components/ReviewsWidget";
import { ReviewsWidgetProvider } from "@/components/ReviewsWidgetContext";
import { CartWidget } from "@/components/CartWidget";
import "overlayscrollbars/overlayscrollbars.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReviewsWidgetProvider>
      <DocumentScrollbar />
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <ReviewsWidget />
      <CartWidget />
    </ReviewsWidgetProvider>
  );
}
