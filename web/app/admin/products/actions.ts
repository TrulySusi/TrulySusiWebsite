"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_IMAGES_PER_PRODUCT = 6;
const IMAGE_BUCKET = "product-images";

async function requireAdmin() {
  const { admin } = await getAdminSession();
  if (!admin) throw new Error("Not authorized");
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------- products ----------

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");
  const slug = slugify(String(formData.get("slug") ?? "") || name);

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      category_id: formData.get("category_id") || null,
      short_description: String(formData.get("short_description") ?? "") || null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`A product with the slug "${slug}" already exists. Try a different name or slug.`);
    }
    throw new Error(error.message);
  }
  revalidatePath("/admin/products");
  return data.id as string;
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const shelfLife = String(formData.get("shelf_life_days") ?? "").trim();
  const servingSize = String(formData.get("serving_size_g") ?? "").trim();

  const nutrition: Record<string, number> = {};
  let hasNutrition = false;
  for (const key of NUTRITION_FIELDS) {
    const raw = String(formData.get(`nutrition_${key}`) ?? "").trim();
    if (raw) {
      hasNutrition = true;
      nutrition[key] = Number(raw);
    }
  }

  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug: slugify(String(formData.get("slug") ?? "") || name),
      category_id: formData.get("category_id") || null,
      short_description: String(formData.get("short_description") ?? "") || null,
      description: String(formData.get("description") ?? "") || null,
      ingredients: String(formData.get("ingredients") ?? "") || null,
      allergen_info: String(formData.get("allergen_info") ?? "") || null,
      shelf_life_days: shelfLife ? Number(shelfLife) : null,
      serving_size_g: servingSize ? Number(servingSize) : null,
      status: String(formData.get("status") ?? "draft"),
      is_featured: formData.get("is_featured") === "on",
      nutrition_per_100g: hasNutrition ? nutrition : null,
    })
    .eq("id", productId);

  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
  revalidatePath("/admin/products");
}

export const NUTRITION_FIELDS = [
  "energy_kcal",
  "protein_g",
  "total_carb_g",
  "total_fat_g",
  "saturated_fat_g",
  "trans_fat_g",
  "mono_unsat_fat_g",
  "poly_unsat_fat_g",
  "added_sugar_g",
  "total_sugar_g",
  "cholesterol_mg",
  "dietary_fibre_g",
  "sodium_mg",
] as const;

// ---------- variants ----------

export async function createVariant(productId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const label = String(formData.get("label") ?? "").trim();
  const weight = Number(formData.get("weight_grams") ?? 0);
  const sku = String(formData.get("sku") ?? "").trim();
  const price = Number(formData.get("price_inr") ?? 0);
  if (!label || !weight || !sku || !price) throw new Error("Missing required variant fields");

  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    label,
    weight_grams: weight,
    sku,
    price_inr: price,
    compare_at_price_inr: formData.get("compare_at_price_inr")
      ? Number(formData.get("compare_at_price_inr"))
      : null,
    stock_qty: Number(formData.get("stock_qty") ?? 0),
    is_default: formData.get("is_default") === "on",
    is_active: formData.get("is_active") === "on",
  });

  if (error) throw error;
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateVariant(productId: string, variantId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("product_variants")
    .update({
      label: String(formData.get("label") ?? "").trim(),
      weight_grams: Number(formData.get("weight_grams") ?? 0),
      sku: String(formData.get("sku") ?? "").trim(),
      price_inr: Number(formData.get("price_inr") ?? 0),
      compare_at_price_inr: formData.get("compare_at_price_inr")
        ? Number(formData.get("compare_at_price_inr"))
        : null,
      stock_qty: Number(formData.get("stock_qty") ?? 0),
      is_default: formData.get("is_default") === "on",
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", variantId);

  if (error) throw error;
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariant(productId: string, variantId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
  if (error) throw error;
  revalidatePath(`/admin/products/${productId}`);
}

// ---------- images ----------

export async function uploadProductImage(productId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No file provided");

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  if ((count ?? 0) >= MAX_IMAGES_PER_PRODUCT) {
    throw new Error(`A product can have at most ${MAX_IMAGES_PER_PRODUCT} images`);
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const variantId = String(formData.get("variant_id") ?? "") || null;
  const altText = String(formData.get("alt_text") ?? "") || null;

  const { error: insertError } = await supabase.from("product_images").insert({
    product_id: productId,
    variant_id: variantId,
    storage_path: path,
    alt_text: altText,
    sort_order: count ?? 0,
  });
  if (insertError) throw insertError;

  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductImage(productId: string, imageId: string, storagePath: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  await supabase.storage.from(IMAGE_BUCKET).remove([storagePath]);
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw error;

  revalidatePath(`/admin/products/${productId}`);
}

// Takes the full desired image order and rewrites sort_order 0..n for all
// of them in one go — simpler and more robust than incremental swaps.
export async function reorderProductImages(productId: string, orderedImageIds: string[]) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await Promise.all(
    orderedImageIds.map((id, index) =>
      supabase.from("product_images").update({ sort_order: index }).eq("id", id),
    ),
  ).then((results) => {
    const failed = results.find((r) => r.error);
    return { error: failed?.error ?? null };
  });
  if (error) throw error;

  revalidatePath(`/admin/products/${productId}`);
}
