import Link from "next/link";
import { X } from "lucide-react";
import { DESIGN_TOKENS } from "@boxing-gym/config";
import { Button } from "@/components/ui/button";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-atmosphere relative flex min-h-full flex-col items-center justify-center px-4 py-16">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        aria-label="Back to home"
        render={
          <Link href="/">
            <X />
          </Link>
        }
        nativeButton={false}
      />
      <Link href="/" className="mb-8 text-lg font-bold tracking-tight uppercase">
        {DESIGN_TOKENS.siteName}
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
