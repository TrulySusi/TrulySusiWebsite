import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminVariantsEditor } from "@/components/admin/AdminVariantsEditor";
import { AdminImagesEditor } from "@/components/admin/AdminImagesEditor";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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
      <AdminPageHeader
        title={product.name}
        subtitle={`/shop/${product.slug}`}
        action={<DeleteProductButton productId={id} name={product.name} />}
      />
      <div className="p-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          <AdminProductForm product={product} categories={categories ?? []} />
          <AdminVariantsEditor
            productId={id}
            variants={variants ?? []}
            servingSizeG={product.serving_size_g}
          />
          <AdminImagesEditor productId={id} images={images ?? []} variants={variants ?? []} />
        </div>
      </div>
    </div>
  );
}
