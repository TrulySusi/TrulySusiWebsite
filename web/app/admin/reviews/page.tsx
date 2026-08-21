import { createAdminClient } from "@/lib/supabase/admin";
import { AdminReviewsList } from "@/components/admin/AdminReviewsList";

export default async function AdminReviewsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, review_text, approved, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-navy">Reviews</h1>
      <p className="mt-1 font-body text-sm text-navy/60">
        Approve reviews to show them in the site-wide reviews widget.
      </p>
      <div className="mt-8">
        <AdminReviewsList reviews={data ?? []} />
      </div>
    </div>
  );
}
