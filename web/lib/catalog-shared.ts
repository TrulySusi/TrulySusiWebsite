// Types and pure helpers safe to import from Client Components. Anything
// that touches Supabase (lib/catalog.ts) is server-only — importing it from
// a "use client" file pulls in next/headers and breaks the build.

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

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  is_featured: boolean;
  product_variants: ProductVariant[];
  product_images: ProductImage[];
  categories: { name: string } | null;
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

/**
 * Temporary — real, relevant Indian-sweets photography from Wikimedia
 * Commons (freely licensed), standing in until real product/lifestyle
 * photography is assigned. Curated by hand rather than pulled from a
 * generic random-image service, so what shows is actually a sweet /
 * relevant scene, not an arbitrary unrelated stock photo.
 *
 * Swap callers back to `productImageUrl` (real Supabase Storage photos,
 * already wired and working for Mysore Pak) once real photography exists
 * for a given slot.
 */
const COMMONS_FILE_BY_SEED: Record<string, string> = {
  // Home hero — "Wheat Halwa of Salem": glossy macro shot, and literally
  // photographed in Salem, where the brand is from.
  "home-hero": "Wheat Halwa of Salem.jpg",
  // Meet Susi — an assorted-sweets spread on a home kitchen counter.
  // Deliberately not a photo of an unrelated real person standing in
  // for Susi; this is a kitchen/process scene instead.
  "meet-susi": "Assorted Indian Sweets.jpg",
  "mysore-pak": "Mysore pak.jpg",
  thenkulal: "Traditional Murukku, a must have for festivals such as Deepavali.jpg",
  "badam-halwa": "Tirunelveli halwa.jpg",
};

const COMMONS_FALLBACK_FILE = "Assorted Indian Sweets.jpg";

export function placeholderImageUrl(seed: string, width = 800) {
  const file = COMMONS_FILE_BY_SEED[seed] ?? COMMONS_FALLBACK_FILE;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
}

// Tamil-script product names, confirmed from the client's own pre-launch
// site (agent-6a27e90e6ed607732e9739cc--trulysusiin.netlify.app) — real
// brand copy, not a translation guess. Only add an entry here once the
// client has confirmed the exact spelling; leaving a product out just
// means no Tamil name shows for it yet.
const TAMIL_NAME_BY_SLUG: Record<string, string> = {
  "mysore-pak": "மைசூர் பாக்",
  "badam-halwa": "பாதாம் அல்வா",
};

export function tamilName(slug: string): string | null {
  return TAMIL_NAME_BY_SLUG[slug] ?? null;
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
