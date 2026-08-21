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
      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={null}>
            <AdminProductsFilters />
          </Suspense>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.length === 0 && (
              <p className="col-span-full font-body text-sm text-navy/50">No products match.</p>
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
                  className="group flex flex-col overflow-hidden rounded-xl border border-navy/10 bg-white transition-colors hover:border-navy/25"
                >
                  <div className="relative aspect-square bg-navy/4">
                    {cover ? (
                      <Image
                        src={productImageUrl(cover.storage_path)}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-body text-xs uppercase text-navy/30">
                        No photo
                      </div>
                    )}
                    <span
                      className={`absolute right-2 top-2 rounded-full px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[p.status] ?? "bg-navy/10 text-navy/60"}`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="font-body text-sm font-semibold text-navy">{p.name}</p>
                    <p className="mt-0.5 font-body text-xs text-navy/50">
                      {categoryName ?? "Uncategorized"} &middot; {variants.length} variant
                      {variants.length === 1 ? "" : "s"}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      {price !== null ? (
                        <span className="font-body text-sm font-bold text-navy">from ₹{price}</span>
                      ) : (
                        <span className="font-body text-xs text-navy/40">No price set</span>
                      )}
                      <span className="font-body text-xs text-navy/50">stock {totalStock}</span>
                    </div>
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
