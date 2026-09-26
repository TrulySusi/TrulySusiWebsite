import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Ensures a `customers` row exists for this auth user, keyed by the id/email
 * Supabase Auth always has. First/last name only get written when they're
 * present in `user_metadata` (set at signup) — on conflict, upsert only
 * touches columns present in the payload, so omitting them here never wipes
 * out a name that's already saved.
 */
export async function upsertCustomerFromAuthUser(supabase: SupabaseClient, user: User) {
  const firstName = (user.user_metadata?.first_name as string | undefined)?.trim();
  const lastName = (user.user_metadata?.last_name as string | undefined)?.trim();

  const payload: Record<string, unknown> = { id: user.id, email: user.email };
  if (firstName) payload.first_name = firstName;
  if (lastName) payload.last_name = lastName;
  if (firstName && lastName) payload.full_name = `${firstName} ${lastName}`;

  await supabase.from("customers").upsert(payload, { onConflict: "id" });
}
