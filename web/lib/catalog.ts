import { createClient } from "@/lib/supabase/server";

export type NutritionPer100g = {
  energy_kcal: number;
  protein_g: number;
  total_carb_g: number;
  total_fat_g: number;
  saturated_fat_g: number;
  trans_fat_g: number;
  mono_unsat_fat_g: number;
  poly_unsat_fat_g: number;
  added_sugar_g: number;
  total_sugar_g: number;
  cholesterol_mg: number;
  dietary_fibre_g: number;
  sodium_mg: number;
};

export type ProductVariant = {
  id: string;
  label: string;
  weight_grams: number;
  price_inr: number;
  compare_at_price_inr: number | null;
  stock_qty: number;
  is_default: boolean;
  is_active: boolean;
};

export type ProductImage = {
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
};

export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  is_featured: boolean;
  product_variants: ProductVariant[];
  product_images: ProductImage[];
};

export type ProductDetail = ProductSummary & {
  description: string | null;
  ingredients: string | null;
  allergen_info: string | null;
  shelf_life_days: number | null;
  serving_size_g: number | null;
  nutrition_per_100g: NutritionPer100g | null;
};

const PRODUCT_IMAGE_BUCKET = "product-images";

export function productImageUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${storagePath}`;
}

/** Lowest active-variant price — what a product card shows as "from ₹__". */
export function startingPrice(variants: ProductVariant[]) {
  const active = variants.filter((v) => v.is_active);
  if (active.length === 0) return null;
  return Math.min(...active.map((v) => v.price_inr));
}

export function defaultVariant(variants: ProductVariant[]) {
  return variants.find((v) => v.is_default && v.is_active) ?? variants.find((v) => v.is_active) ?? null;
}

const SUMMARY_SELECT = `
  id, slug, name, short_description, is_featured,
  product_variants ( id, label, weight_grams, price_inr, compare_at_price_inr, stock_qty, is_default, is_active ),
  product_images ( storage_path, alt_text, sort_order )
`;

export async function getActiveProducts(): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SUMMARY_SELECT)
    .eq("status", "active")
    .order("sort_order");

  if (error) throw error;
  return data as unknown as ProductSummary[];
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      ${SUMMARY_SELECT},
      description, ingredients, allergen_info, shelf_life_days, serving_size_g, nutrition_per_100g
    `)
    .eq("status", "active")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ProductDetail | null;
}

export async function getRelatedProducts(excludeSlug: string, limit = 3): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SUMMARY_SELECT)
    .eq("status", "active")
    .neq("slug", excludeSlug)
    .order("sort_order")
    .limit(limit);

  if (error) throw error;
  return data as unknown as ProductSummary[];
}
