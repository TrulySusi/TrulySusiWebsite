import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Category, ProductDetail, ProductSummary } from "@/lib/catalog-shared";

export * from "@/lib/catalog-shared";

const SUMMARY_SELECT = `
  id, slug, name, short_description, is_featured,
  product_variants ( id, label, weight_grams, price_inr, compare_at_price_inr, stock_qty, is_default, is_active ),
  product_images ( storage_path, alt_text, sort_order ),
  categories ( name )
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

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description")
    .order("sort_order");

  if (error) throw error;
  return data as Category[];
}

export async function getFeaturedProducts(limit = 4): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SUMMARY_SELECT)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("sort_order")
    .limit(limit);

  if (error) throw error;
  return data as unknown as ProductSummary[];
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
