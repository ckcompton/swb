import Link from "next/link";
import { formatDisplayName, formatInitials } from "@boxing-gym/utils";
import { DESIGN_TOKENS } from "@boxing-gym/config";
import type { Profile } from "@boxing-gym/domain";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";

export function AppHeader({ profile, homeHref }: { profile: Profile; homeHref: string }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={homeHref} className="text-lg font-bold tracking-tight uppercase">
          {DESIGN_TOKENS.siteName}
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">
              {formatDisplayName(profile.firstName, profile.lastName)}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
          </div>
          <Avatar>
            <AvatarFallback>{formatInitials(profile.firstName, profile.lastName)}</AvatarFallback>
          </Avatar>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
