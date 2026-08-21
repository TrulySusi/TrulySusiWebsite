import { createAdminClient } from "@/lib/supabase/admin";
import { AdminReviewsList } from "@/components/admin/AdminReviewsList";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminReviewsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, review_text, approved, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        title="Reviews"
        subtitle="Approve reviews to show them in the site-wide reviews widget."
      />
      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <AdminReviewsList reviews={data ?? []} />
        </div>
      </div>
    </div>
  );
}
