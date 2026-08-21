import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminVariantsEditor } from "@/components/admin/AdminVariantsEditor";
import { AdminImagesEditor } from "@/components/admin/AdminImagesEditor";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductTabs } from "@/components/admin/AdminProductTabs";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: product }, { data: categories }, { data: variants }, { data: images }] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase.from("categories").select("id, name").order("sort_order"),
      supabase.from("product_variants").select("*").eq("product_id", id).order("weight_grams"),
      supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("sort_order"),
    ]);

  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader title={product.name} />
      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/admin/products"
              className="font-body text-sm font-semibold text-navy/60 hover:text-navy"
            >
              ← Back to products
            </Link>
            <div className="flex items-center gap-4">
              {product.status === "active" && (
                <Link
                  href={`/shop/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm font-semibold text-navy/60 hover:text-navy"
                >
                  View on site ↗
                </Link>
              )}
              <DeleteProductButton productId={id} name={product.name} />
            </div>
          </div>

          <AdminProductTabs
            tabs={[
              {
                id: "basic",
                label: "Basic info",
                content: <AdminProductForm product={product} categories={categories ?? []} />,
              },
              {
                id: "variants",
                label: "Variants",
                content: (
                  <AdminVariantsEditor
                    productId={id}
                    variants={variants ?? []}
                    servingSizeG={product.serving_size_g}
                  />
                ),
              },
              {
                id: "images",
                label: "Images",
                content: (
                  <AdminImagesEditor productId={id} images={images ?? []} variants={variants ?? []} />
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
