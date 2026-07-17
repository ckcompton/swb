import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DESIGN_TOKENS } from "@boxing-gym/config";

export const metadata: Metadata = {
  title: "Home",
  description: `Train at ${DESIGN_TOKENS.siteName}. Classes for all levels, expert trainers, real results.`,
};

const HIGHLIGHTS = [
  {
    title: "Expert coaching",
    body: "Learn from trainers with real competitive experience, from your first jab to advanced sparring.",
  },
  {
    title: "Classes for every level",
    body: "Beginner fundamentals, conditioning circuits, and advanced sparring prep on a published weekly schedule.",
  },
  {
    title: "Simple membership",
    body: "One membership, straightforward pricing, book any class with a tap.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">
            {DESIGN_TOKENS.siteName}
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Train hard. Fight smart.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            A no-frills boxing gym built for beginners and competitors alike. Real coaching, real
            classes, real results.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              size="lg"
              className="h-12 px-8 text-base"
              render={<Link href="/signup">Join now</Link>}
              nativeButton={false}
            />
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base"
              render={<Link href="/schedule">View schedule</Link>}
              nativeButton={false}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="max-w-xl text-muted-foreground">
            Create an account, browse the schedule, and book your first class today.
          </p>
          <Button size="lg" render={<Link href="/signup">Sign up</Link>} nativeButton={false} />
        </div>
      </section>
    </div>
  );
}
