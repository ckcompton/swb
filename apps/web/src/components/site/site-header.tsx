import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { DESIGN_TOKENS } from "@boxing-gym/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuthContext } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#programs", label: "Programs" },
  { href: "/trainers", label: "Coaches" },
  { href: "/pricing", label: "Pricing" },
  { href: "/waiver", label: "Sign Waiver" },
  { href: "/#contact", label: "Contact" },
];

export async function SiteHeader() {
  const auth = await getAuthContext();

  return (
    <header className="relative border-b border-border/60 backdrop-blur-md">
      <div aria-hidden className="bg-atmosphere-panel absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
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
            render={<Link href={auth ? "/admin" : "/login"}>Admin login</Link>}
            nativeButton={false}
          />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-40">
              {NAV_LINKS.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  render={<Link href={link.href}>{link.label}</Link>}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
