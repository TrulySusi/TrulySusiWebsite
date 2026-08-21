import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminVariantsEditor } from "@/components/admin/AdminVariantsEditor";
import { AdminImagesEditor } from "@/components/admin/AdminImagesEditor";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

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
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-navy">{product.name}</h1>
          <p className="mt-1 font-body text-sm text-navy/60">/shop/{product.slug}</p>
        </div>
        <DeleteProductButton productId={id} name={product.name} />
      </div>

      <AdminProductForm product={product} categories={categories ?? []} />
      <AdminVariantsEditor
        productId={id}
        variants={variants ?? []}
        servingSizeG={product.serving_size_g}
      />
      <AdminImagesEditor productId={id} images={images ?? []} variants={variants ?? []} />
    </div>
  );
}
