import { requireMember } from "@/lib/auth";
import { AppHeader } from "@/components/shared/app-header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireMember();

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader profile={auth.profile} homeHref="/dashboard" />
      <DashboardNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
