import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminNewOrderForm } from "@/components/admin/AdminNewOrderForm";

export default async function NewOrderPage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, product_variants ( id, label, price_inr, is_active )")
    .eq("status", "active")
    .order("sort_order");

  return (
    <div>
      <AdminPageHeader
        title="New order"
        subtitle="For orders taken over WhatsApp or Instagram DM."
      />
      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/admin/orders"
            className="mb-6 inline-block font-body text-sm font-semibold text-navy/60 hover:text-navy"
          >
            ← Back to orders
          </Link>
          <AdminNewOrderForm products={products ?? []} />
        </div>
      </div>
    </div>
  );
}
