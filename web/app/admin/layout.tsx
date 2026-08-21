import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  // Kept out of search results — this isn't a page for customers.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { authedEmail, admin } = await getAdminSession();

  if (!authedEmail) {
    return <AdminLoginForm />;
  }

  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="max-w-sm rounded-2xl border border-navy/10 bg-white p-8 text-center">
          <h1 className="font-display text-2xl text-navy">Not authorized</h1>
          <p className="mt-3 font-body text-sm text-navy/60">
            {authedEmail} isn&rsquo;t set up as an admin. Ask the site owner to add you.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminNav name={admin.full_name ?? admin.email} role={admin.role} />
      <main className="flex-1 overflow-x-auto">{children}</main>
    </div>
  );
}
