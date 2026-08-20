// Seeds/updates the product catalog from real packaging-label data.
// Idempotent — safe to re-run as more products/sizes get confirmed.
//
// Usage: node scripts/seed-catalog.mjs   (reads web/.env.local)

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { WebSocket } from "ws";

const IMAGE_BUCKET = "product-images";

// supabase-js always initializes a realtime client, which needs a native
// WebSocket global — not present until Node 22. This script never uses
// realtime, but the polyfill has to exist to avoid a startup crash on
// Node 20 (see https://github.com/orgs/supabase/discussions/45715).
if (!globalThis.WebSocket) globalThis.WebSocket = WebSocket;

function loadEnvLocal() {
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
}
loadEnvLocal();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const BRAND_STORY =
  "Born from a mother's lifelong love for feeding people well, Truly Susi's " +
  "carries family recipes that were never written down, only passed " +
  "between hands, remembered in taste, and felt in every bite. Made to be " +
  "shared beyond the home. And meant to take you right back to one.";

async function upsertCategory({ slug, name, sort_order }) {
  const { data, error } = await supabase
    .from("categories")
    .upsert({ slug, name, sort_order }, { onConflict: "slug" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function upsertProduct(categoryId, product) {
  const { data, error } = await supabase
    .from("products")
    .upsert({ ...product, category_id: categoryId }, { onConflict: "slug" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function upsertVariants(productId, variants) {
  const rows = variants.map((v) => ({ ...v, product_id: productId }));
  const { error } = await supabase
    .from("product_variants")
    .upsert(rows, { onConflict: "sku" });
  if (error) throw error;
}

async function ensureImageBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (buckets.some((b) => b.name === IMAGE_BUCKET)) return;

  const { error: createError } = await supabase.storage.createBucket(IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: "5MB",
  });
  if (createError) throw createError;
  console.log("created storage bucket:", IMAGE_BUCKET);
}

async function upsertProductImage(productId, { localPath, storagePath, altText, sortOrder }) {
  const file = readFileSync(new URL(localPath, import.meta.url));
  const contentType = storagePath.endsWith(".png") ? "image/png" : "image/jpeg";

  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(storagePath, file, { contentType, upsert: true });
  if (uploadError) throw uploadError;

  const { error } = await supabase
    .from("product_images")
    .upsert(
      { product_id: productId, storage_path: storagePath, alt_text: altText, sort_order: sortOrder },
      { onConflict: "product_id,storage_path" },
    );
  if (error) throw error;
}

async function upsertSiteSetting(key, value) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
}

async function main() {
  await ensureImageBucket();

  const categoryId = await upsertCategory({
    slug: "sweets",
    name: "Sweet",
    sort_order: 0,
  });
  // Empty on purpose — no real savoury product/pricing exists yet. Having
  // the category exist is what makes the All/Sweet/Savoury filter show up
  // on the menu; it'll just show "nothing here yet" until a real savoury
  // item is added.
  await upsertCategory({
    slug: "savoury",
    name: "Savoury",
    sort_order: 1,
  });
  console.log("categories ready:", categoryId);

  // ---- Mysore Pak — full label data confirmed 2026-08-18 ----
  const mysorePakId = await upsertProduct(categoryId, {
    slug: "mysore-pak",
    name: "Mysore Pak",
    short_description:
      "Rich, melt-in-your-mouth ghee fudge with the perfect crumble. Gram flour, pure ghee, and patience. No substitutes the way it was always meant to taste.",
    description: BRAND_STORY,
    ingredients: "Ghee, Sugar, Gram Flour, Water",
    allergen_info: "Contains dairy (ghee).",
    shelf_life_days: 15,
    serving_size_g: 10,
    nutrition_per_100g: {
      energy_kcal: 606,
      protein_g: 6,
      total_carb_g: 47,
      total_fat_g: 44,
      saturated_fat_g: 29,
      trans_fat_g: 0.38,
      mono_unsat_fat_g: 13,
      poly_unsat_fat_g: 2,
      added_sugar_g: 28,
      total_sugar_g: 29,
      cholesterol_mg: 22,
      dietary_fibre_g: 1,
      sodium_mg: 48,
    },
    status: "active",
    is_featured: true,
    sort_order: 1,
  });
  await upsertVariants(mysorePakId, [
    { label: "100g box", weight_grams: 100, sku: "TS-MYSPAK-100", price_inr: 95.0, stock_qty: 15, is_default: false, is_active: true },
    { label: "200g box", weight_grams: 200, sku: "TS-MYSPAK-200", price_inr: 190.0, stock_qty: 15, is_default: false, is_active: true },
    { label: "250g box", weight_grams: 250, sku: "TS-MYSPAK-250", price_inr: 240.0, stock_qty: 15, is_default: true, is_active: true },
    { label: "500g box", weight_grams: 500, sku: "TS-MYSPAK-500", price_inr: 475.0, stock_qty: 15, is_default: false, is_active: true },
  ]);
  await upsertProductImage(mysorePakId, {
    localPath: "../public/brand/mysore_pak_image.png",
    storagePath: "mysore-pak/mysore_pak_hero.png",
    altText: "Mysore Pak, stacked pieces on a brass plate with a Truly Susi jar",
    sortOrder: 0,
  });
  await upsertProductImage(mysorePakId, {
    localPath: "../public/seed/mysore_pak.jpg",
    storagePath: "mysore-pak/mysore_pak.jpg",
    altText: "Mysore Pak, stacked pieces in a box",
    sortOrder: 1,
  });
  console.log("mysore pak ready:", mysorePakId);

  // ---- Badam Halwa — full pricing confirmed 2026-08-20 (₹1,400/kg, MRP
  // rounded up to the nearest ₹5) ----
  const badamHalwaId = await upsertProduct(categoryId, {
    slug: "badam-halwa",
    name: "Badam Halwa",
    short_description:
      "Slow-cooked almond halwa, silky and fragrant with saffron and cardamom. A labour of love that takes hours, so you can savour it in seconds.",
    description: BRAND_STORY,
    ingredients: "Almonds, Ghee, Sugar, Cardamom, Saffron",
    allergen_info: "Contains dairy (ghee) and tree nuts (almonds).",
    status: "active",
    is_featured: false,
    sort_order: 2,
  });
  await upsertVariants(badamHalwaId, [
    { label: "100g box", weight_grams: 100, sku: "TS-BDMHLW-100", price_inr: 150.0, stock_qty: 15, is_default: false, is_active: true },
    { label: "200g box", weight_grams: 200, sku: "TS-BDMHLW-200", price_inr: 295.0, stock_qty: 15, is_default: false, is_active: true },
    { label: "250g box", weight_grams: 250, sku: "TS-BDMHLW-250", price_inr: 370.0, stock_qty: 15, is_default: true, is_active: true },
    { label: "500g box", weight_grams: 500, sku: "TS-BDMHLW-500", price_inr: 735.0, stock_qty: 15, is_default: false, is_active: true },
  ]);
  await upsertProductImage(badamHalwaId, {
    localPath: "../public/brand/badam_halwa_image.png",
    storagePath: "badam-halwa/badam_halwa_hero.png",
    altText: "Badam Halwa in a brass kadai with almonds and a Truly Susi ghee jar",
    sortOrder: 0,
  });
  console.log("badam halwa ready (active):", badamHalwaId);

  // ---- Thenkulal — placeholder, details to follow ----
  const thenkulalId = await upsertProduct(categoryId, {
    slug: "thenkulal",
    name: "Thenkulal",
    short_description: "The festival sweet most have forgotten. Susi hasn't.",
    description: null,
    ingredients: null,
    status: "draft",
    is_featured: false,
    sort_order: 3,
  });
  console.log("thenkulal ready (draft, no variants yet):", thenkulalId);

  // ---- Site-wide facts, reused in footer / PDP compliance block / invoices ----
  await upsertSiteSetting("manufacturer", {
    manufactured_by: "Truly Susi",
    address: "111/1, Thathampatti, P.B. No. 5, K.N. Colony, Salem, Tamil Nadu - 636014",
    country_of_origin: "Product of Tamil Nadu",
  });
  await upsertSiteSetting("customer_care", {
    email: "feedback@trulysusi.in",
  });
  await upsertSiteSetting("legal_entity", {
    name: "Aahara Heritage LLP",
    pan: "ACNFA7382E",
  });
  // fssai_license intentionally omitted — number not issued yet.

  console.log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
