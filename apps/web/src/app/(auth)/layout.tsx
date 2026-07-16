import Link from "next/link";
import { DESIGN_TOKENS } from "@boxing-gym/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-16">
      <Link href="/" className="mb-8 text-lg font-bold tracking-tight uppercase">
        {DESIGN_TOKENS.siteName}
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
