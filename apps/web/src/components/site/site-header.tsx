import Link from "next/link";
import Image from "next/image";
import { DESIGN_TOKENS } from "@boxing-gym/config";
import { Button } from "@/components/ui/button";
import { getAuthContext } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#programs", label: "Programs" },
  { href: "/trainers", label: "Coaches" },
  { href: "/coming-soon", label: "Gallery" },
  { href: "/schedule", label: "Schedule" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#contact", label: "Contact" },
];

export async function SiteHeader() {
  const auth = await getAuthContext();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo-v2.png"
            alt={DESIGN_TOKENS.siteName}
            width={1100}
            height={475}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="hidden sm:inline-flex"
            render={
              auth ? (
                <Link href={auth.profile.role === "admin" ? "/admin" : "/dashboard"}>
                  My account
                </Link>
              ) : (
                <Link href="/login">Log in</Link>
              )
            }
            nativeButton={false}
          />
          <Button render={<Link href="/signup">Book a session</Link>} nativeButton={false} />
        </div>
      </div>
    </header>
  );
}
