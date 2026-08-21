import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-sage/20 text-sage",
  draft: "bg-navy/10 text-navy/60",
  archived: "bg-brass/10 text-brass",
};

export default async function AdminProductsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, slug, name, status, sort_order, product_variants ( price_inr, is_active, stock_qty ), categories ( name )",
    )
    .order("sort_order");

  const products = data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-navy px-5 py-2.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          + New product
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {products.length === 0 && (
          <p className="font-body text-sm text-navy/50">No products yet.</p>
        )}
        {products.map((p) => {
          const variants = (p.product_variants ?? []) as {
            price_inr: number;
            is_active: boolean;
            stock_qty: number;
          }[];
          const activePrices = variants.filter((v) => v.is_active).map((v) => v.price_inr);
          const price = activePrices.length > 0 ? Math.min(...activePrices) : null;
          const totalStock = variants.reduce((sum, v) => sum + v.stock_qty, 0);
          const category = (p.categories as unknown as { name: string }[] | { name: string } | null);
          const categoryName = Array.isArray(category) ? category[0]?.name : category?.name;
          return (
            <Link
              key={p.id}
              href={`/admin/products/${p.id}`}
              className="flex items-center justify-between rounded-xl border border-navy/10 bg-white px-5 py-4 transition-colors hover:border-navy/25"
            >
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold text-navy">{p.name}</p>
                <p className="font-body text-xs text-navy/50">
                  {categoryName ?? "Uncategorized"} &middot;{" "}
                  {variants.length} variant{variants.length === 1 ? "" : "s"} &middot; stock{" "}
                  {totalStock}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {price !== null && (
                  <span className="font-body text-sm font-bold text-navy">from ₹{price}</span>
                )}
                <span
                  className={`rounded-full px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[p.status] ?? "bg-navy/10 text-navy/60"}`}
                >
                  {p.status}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
