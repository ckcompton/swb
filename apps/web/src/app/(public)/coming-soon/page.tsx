import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "This page is on its way.",
};

export default function ComingSoonPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <h1 className="font-heading text-4xl font-bold tracking-tight uppercase sm:text-5xl">
        Coming <span className="text-gold">soon.</span>
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        We&rsquo;re still putting this page together. Check back soon.
      </p>
      <Button className="mt-8" render={<Link href="/">Back to home</Link>} nativeButton={false} />
    </div>
  );
}
