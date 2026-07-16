import Link from "next/link";
import { DESIGN_TOKENS } from "@boxing-gym/config";
import { Button } from "@/components/ui/button";
import { getAuthContext } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/schedule", label: "Schedule" },
  { href: "/trainers", label: "Trainers" },
  { href: "/pricing", label: "Pricing" },
];

export async function SiteHeader() {
  const auth = await getAuthContext();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight uppercase">
          {DESIGN_TOKENS.siteName}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {auth ? (
            <Button
              size="sm"
              render={
                <Link href={auth.profile.role === "admin" ? "/admin" : "/dashboard"}>
                  Dashboard
                </Link>
              }
              nativeButton={false}
            />
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/login">Log in</Link>}
                nativeButton={false}
              />
              <Button size="sm" render={<Link href="/signup">Sign up</Link>} nativeButton={false} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
