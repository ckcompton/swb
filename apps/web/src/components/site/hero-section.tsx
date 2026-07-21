import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DESIGN_TOKENS } from "@boxing-gym/config";

export function HeroSection() {
  return (
    <section className="relative border-b border-border">
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/hero-background.jpg')] bg-contain bg-right bg-no-repeat contrast-110"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div
        aria-hidden
        className="absolute inset-0 [background-image:var(--texture-noise)] [background-repeat:repeat] [background-size:180px_180px]"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <p className="text-sm font-semibold tracking-[0.3em] text-gold uppercase">
          Train in the dark.
        </p>
        <h1 className="mt-4 max-w-2xl font-heading text-5xl leading-[0.95] font-bold tracking-tight uppercase sm:text-7xl">
          Find your{" "}
          <span className="font-brush -rotate-2 inline-block tracking-normal text-gold">
            fight.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          {`Discipline. Focus. Heart. ${DESIGN_TOKENS.siteName} builds more than boxers — we build warriors for life.`}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            size="lg"
            className="h-12 px-8 text-base"
            render={<Link href="/signup">Book your first session</Link>}
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
  );
}
