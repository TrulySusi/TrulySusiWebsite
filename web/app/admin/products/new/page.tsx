import { createAdminClient } from "@/lib/supabase/admin";
import { AdminNewProductForm } from "@/components/admin/AdminNewProductForm";

export default async function NewProductPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("sort_order");

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl text-navy">New product</h1>
      <p className="mt-1 font-body text-sm text-navy/60">
        Starts as a draft. You&rsquo;ll add variants and images on the next screen.
      </p>
      <div className="mt-8">
        <AdminNewProductForm categories={categories ?? []} />
      </div>
    </div>
  );
}
