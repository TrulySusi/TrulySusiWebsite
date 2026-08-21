"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const { admin } = await getAdminSession();
  if (!admin) throw new Error("Not authorized");
}

export async function approveReview(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").update({ approved: true }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/reviews");
}

export async function unapproveReview(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").update({ approved: false }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/reviews");
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/reviews");
}
