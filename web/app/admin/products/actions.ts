"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { NUTRITION_FIELDS, weightLabel } from "@/lib/catalog-shared";

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

// Shared by createProduct and updateProduct so the "new product" wizard's
// first step and the full edit page's Basic info tab accept exactly the
// same fields.
function buildProductFields(formData: FormData) {
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

  return {
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
  };
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const fields = buildProductFields(formData);

  const { data, error } = await supabase.from("products").insert(fields).select("id").single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`A product with the slug "${fields.slug}" already exists. Try a different name or slug.`);
    }
    throw new Error(error.message);
  }
  revalidatePath("/admin/products");
  return data.id as string;
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update(buildProductFields(formData))
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

// ---------- variants ----------

export async function createVariant(productId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const weight = Number(formData.get("weight_grams") ?? 0);
  const price = Number(formData.get("price_inr") ?? 0);
  if (!weight || !price) throw new Error("Missing required variant fields");

  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    label: weightLabel(weight),
    weight_grams: weight,
    price_inr: price,
    compare_at_price_inr: formData.get("compare_at_price_inr")
      ? Number(formData.get("compare_at_price_inr"))
      : null,
    is_default: formData.get("is_default") === "on",
    is_active: formData.get("is_active") === "on",
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error(`This product already has a variant with that weight (${weight}g).`);
    }
    throw new Error(error.message);
  }
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateVariant(productId: string, variantId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const weight = Number(formData.get("weight_grams") ?? 0);

  const { error } = await supabase
    .from("product_variants")
    .update({
      label: weightLabel(weight),
      weight_grams: weight,
      price_inr: Number(formData.get("price_inr") ?? 0),
      compare_at_price_inr: formData.get("compare_at_price_inr")
        ? Number(formData.get("compare_at_price_inr"))
        : null,
      is_default: formData.get("is_default") === "on",
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", variantId);

  if (error) {
    if (error.code === "23505") {
      throw new Error("This product already has a variant with that weight.");
    }
    throw new Error(error.message);
  }
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariant(productId: string, variantId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
  if (error) throw error;
  revalidatePath(`/admin/products/${productId}`);
}

export async function listVariants(productId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, label")
    .eq("product_id", productId)
    .order("weight_grams");
  if (error) throw error;
  return data as { id: string; label: string }[];
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
  const width = formData.get("width") ? Number(formData.get("width")) : null;
  const height = formData.get("height") ? Number(formData.get("height")) : null;

  const { error: insertError } = await supabase.from("product_images").insert({
    product_id: productId,
    variant_id: variantId,
    storage_path: path,
    alt_text: altText,
    sort_order: count ?? 0,
    width,
    height,
    // Default to filling the frame completely, no letterboxing — a
    // "show everything" default left visible empty space on the sides
    // of every portrait photo, which read as broken, not clean. Admins
    // can still zoom out deliberately per photo if they want that.
    zoom: 100,
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

export async function updateImageFocalPoint(productId: string, imageId: string, focalY: number) {
  await requireAdmin();
  const supabase = createAdminClient();

  const clamped = Math.max(0, Math.min(100, Math.round(focalY)));
  const { error } = await supabase
    .from("product_images")
    .update({ focal_y: clamped })
    .eq("id", imageId);
  if (error) throw error;

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateImageZoom(productId: string, imageId: string, zoom: number) {
  await requireAdmin();
  const supabase = createAdminClient();

  const clamped = Math.max(0, Math.min(200, Math.round(zoom)));
  const { error } = await supabase
    .from("product_images")
    .update({ zoom: clamped })
    .eq("id", imageId);
  if (error) throw error;

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
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
