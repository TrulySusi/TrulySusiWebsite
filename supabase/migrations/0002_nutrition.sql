-- Adds lab-certified nutrition data support, surfaced by the Mysore Pak
-- packaging label (Chennai Mettex Lab, Lab No. 2723507-001, 2026-08-13).
-- Run in the Supabase SQL editor against the already-created schema.

alter table products
  add column nutrition_per_100g jsonb,
  add column serving_size_g int;

comment on column products.nutrition_per_100g is
  'Per-100g lab panel, e.g. {"energy_kcal":606,"protein_g":6,"total_carb_g":47,"total_fat_g":44,"saturated_fat_g":29,"trans_fat_g":0.38,"mono_unsat_fat_g":13,"poly_unsat_fat_g":2,"added_sugar_g":28,"total_sugar_g":29,"cholesterol_mg":22,"dietary_fibre_g":1,"sodium_mg":48}. Constant per product regardless of box size.';

comment on column products.serving_size_g is
  'Weight of one piece in grams (e.g. 10). Pieces-per-box for a given variant = variant.weight_grams / serving_size_g — not stored separately.';
