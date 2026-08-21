import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductsFilters } from "@/components/admin/AdminProductsFilters";
import { productImageUrl } from "@/lib/catalog-shared";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-sage/20 text-sage",
  draft: "bg-navy/10 text-navy/60",
  archived: "bg-brass/10 text-brass",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const supabase = createAdminClient();
  let query = supabase
    .from("products")
    .select(
      "id, slug, name, status, sort_order, product_variants ( price_inr, is_active, stock_qty ), categories ( name ), product_images ( storage_path, sort_order )",
    )
    .order("sort_order");

  if (q?.trim()) query = query.ilike("name", `%${q.trim()}%`);
  if (status?.trim()) query = query.eq("status", status.trim());

  const { data } = await query;
  const products = data ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Products"
        action={
          <Link
            href="/admin/products/new"
            className="rounded-full bg-brass px-5 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-brass/90"
          >
            + New product
          </Link>
        }
      />
      <div className="p-8">
        <div className="mx-auto max-w-4xl">
          <Suspense fallback={null}>
            <AdminProductsFilters />
          </Suspense>

          <div className="flex flex-col gap-2">
            {products.length === 0 && (
              <p className="font-body text-sm text-navy/50">No products match.</p>
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
              const category = p.categories as unknown as { name: string }[] | { name: string } | null;
              const categoryName = Array.isArray(category) ? category[0]?.name : category?.name;

              const images = (p.product_images ?? []) as { storage_path: string; sort_order: number }[];
              const cover = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];

              return (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-navy/10 bg-white px-5 py-4 transition-colors hover:border-navy/25"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-navy/4">
                      {cover ? (
                        <Image
                          src={productImageUrl(cover.storage_path)}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-body text-[9px] uppercase text-navy/30">
                          No photo
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-body text-sm font-semibold text-navy">{p.name}</p>
                      <p className="font-body text-xs text-navy/50">
                        {categoryName ?? "Uncategorized"} &middot; {variants.length} variant
                        {variants.length === 1 ? "" : "s"} &middot; stock {totalStock}
                      </p>
                    </div>
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
      </div>
    </div>
  );
}
