import Link from "next/link";
import { DESIGN_TOKENS } from "@boxing-gym/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {DESIGN_TOKENS.siteName}. All rights reserved.
        </p>
        <nav className="flex gap-6">
          <Link
            href="/schedule"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Schedule
          </Link>
          <Link
            href="/trainers"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Trainers
          </Link>
          <Link
            href="/pricing"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Pricing
          </Link>
        </nav>
      </div>
    </footer>
  );
}
