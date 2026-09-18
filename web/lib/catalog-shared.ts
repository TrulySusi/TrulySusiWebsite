// Types and pure helpers safe to import from Client Components. Anything
// that touches Supabase (lib/catalog.ts) is server-only — importing it from
// a "use client" file pulls in next/headers and breaks the build.

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
  is_default: boolean;
  is_active: boolean;
};

export type ProductImage = {
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  focal_y: number;
  zoom: number;
  width: number | null;
  height: number | null;
};

/**
 * Fallback for the rare row with no stored dimensions (shouldn't happen
 * post-migration, but upload could theoretically fail to read them).
 * Matches the 9:16 ratio of most real photos so far.
 */
const FALLBACK_FILL_SCALE = 16 / 9;

/**
 * The scale factor that takes a photo from object-fit: contain (whole
 * photo visible, letterboxed) to filling a frame completely with no
 * letterboxing — i.e. what "cover" would do, but computed explicitly so we
 * can also zoom out past it. Depends on both the photo's own aspect ratio
 * AND the frame's — a landscape photo in a square frame needs a different
 * scale than the same photo in a wide frame, so neither can be a fixed
 * constant across every photo/frame combination.
 */
function fillScale(width: number | null, height: number | null, frameRatio: number) {
  const imageRatio = width && height ? width / height : FALLBACK_FILL_SCALE;
  return Math.max(imageRatio / frameRatio, frameRatio / imageRatio);
}

/**
 * Style for a photo shown in a frame, combining position (focal_y, vertical
 * anchor) and zoom (0 = whole photo visible/letterboxed, 100 = fills the
 * frame with no letterboxing — today's fixed, unadjustable look — 200 =
 * zoomed in tight). Pairs with object-fit: contain as the base so zooming
 * out can actually reveal the full photo, not just shrink an already-
 * cropped view — object-fit: cover can never do that, since it throws away
 * the cropped pixels before any transform runs.
 *
 * frameRatio is the display frame's own width/height (1 for a square
 * frame, the default — pass e.g. 4/3 for a wider, shorter frame) so the
 * math above stays correct for non-square crops too.
 */
export function photoScale(
  zoomPercent: number | null | undefined,
  width?: number | null,
  height?: number | null,
  frameRatio = 1,
) {
  const zoom = zoomPercent ?? 0;
  return 1 + (zoom / 100) * (fillScale(width ?? null, height ?? null, frameRatio) - 1);
}

export function photoZoomStyle(
  focalY: number | null | undefined,
  zoomPercent: number | null | undefined,
  width?: number | null,
  height?: number | null,
  frameRatio = 1,
) {
  const scale = photoScale(zoomPercent, width, height, frameRatio);
  return {
    objectFit: "contain" as const,
    transform: `scale(${scale})`,
    transformOrigin: `50% ${focalY ?? 50}%`,
  };
}

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

/**
 * Real product photo when one's been uploaded (product_images, sorted so
 * index 0 is the cover shot), otherwise the Wikimedia placeholder. Use this
 * instead of calling placeholderImageUrl directly so cards/PDP pick up real
 * photography automatically as it's added, product by product.
 */
export function productPhotoUrl(product: {
  slug: string;
  product_images: ProductImage[];
}) {
  const cover = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
  return cover ? productImageUrl(cover.storage_path) : placeholderImageUrl(product.slug);
}

/** The product's cover photo row (product_images, sorted so index 0 wins), if any. */
export function productCoverImage(product: { product_images: ProductImage[] }) {
  return [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0] as ProductImage | undefined;
}

/**
 * A variant's label is derived from its weight rather than typed by hand
 * (nothing stopped someone from typing anything, e.g. the product's own
 * name instead of a pack size). Shared so the server (actions.ts) and the
 * admin editor's optimistic display always agree.
 */
export function weightLabel(weightGrams: number) {
  if (weightGrams > 0 && weightGrams % 1000 === 0) return `${weightGrams / 1000}kg box`;
  return `${weightGrams}g box`;
}

/** The cover photo's chosen position/zoom style, for wherever productPhotoUrl is rendered. */
export function productPhotoStyle(product: { product_images: ProductImage[] }, frameRatio = 1) {
  const cover = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
  return photoZoomStyle(cover?.focal_y, cover?.zoom, cover?.width, cover?.height, frameRatio);
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
