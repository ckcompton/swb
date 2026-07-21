import { Crown, Hourglass, ShieldCheck, Target } from "lucide-react";
import { DESIGN_TOKENS } from "@boxing-gym/config";

const VALUES = [
  { icon: ShieldCheck, title: "Discipline", body: "Stay consistent. Show up daily." },
  { icon: Target, title: "Focus", body: "Block out distractions. Stay locked in." },
  { icon: Hourglass, title: "Resilience", body: "Embrace the grind. Overcome adversity." },
  { icon: Crown, title: "Confidence", body: "Train your mind. Elevate your life." },
];

export function AboutSection() {
  return (
    <section id="about" className="border-t border-border bg-card/40 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:items-center">
        <div>
          <h2 className="font-heading text-3xl font-bold tracking-tight uppercase sm:text-4xl">
            Built in the shadows. <span className="text-gold">Made for more.</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            {`${DESIGN_TOKENS.siteName} is more than a gym — it's a mindset. We teach discipline, respect, and the will to keep going when no one is watching.`}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div key={value.title} className="flex flex-col items-start gap-2">
              <value.icon aria-hidden className="size-8 text-gold" />
              <h3 className="font-heading text-sm font-semibold tracking-widest uppercase">
                {value.title}
              </h3>
              <p className="text-sm text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
