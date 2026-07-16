import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/shared/app-header";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader profile={auth.profile} homeHref="/admin" />
      <AdminNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
