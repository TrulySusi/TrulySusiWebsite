import { createAdminClient } from "@/lib/supabase/admin";
import { AdminNewProductForm } from "@/components/admin/AdminNewProductForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function NewProductPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("sort_order");

  return (
    <div>
      <AdminPageHeader
        title="New product"
        subtitle="Starts as a draft. You'll add variants and images on the next screen."
      />
      <div className="p-8">
        <div className="mx-auto max-w-lg">
          <AdminNewProductForm categories={categories ?? []} />
        </div>
      </div>
    </div>
  );
}
