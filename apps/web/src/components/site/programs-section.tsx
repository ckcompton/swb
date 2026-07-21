import Image from "next/image";
import { Card } from "@/components/ui/card";

const PROGRAMS = [
  {
    title: "Youth Boxing",
    body: "Build confidence, discipline, and strong fundamentals in a safe, structured environment.",
    image: "/program-youth.jpg",
  },
  {
    title: "Adult Training",
    body: "Get in shape, learn real skills, and train with purpose alongside a committed community.",
    image: "/program-adult.jpg",
  },
  {
    title: "Personal Coaching",
    body: "Customized training built around your goals, one-on-one with our coaching staff.",
    image: "/program-coaching.jpg",
  },
];

export function ProgramsSection() {
  return (
    <section id="programs" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight uppercase sm:text-4xl">
          Programs
        </h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {PROGRAMS.map((program) => (
          <Card
            key={program.title}
            className="relative min-h-[420px] overflow-hidden border-border/60 p-0"
          >
            <Image
              src={program.image}
              alt=""
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
            <div className="relative flex h-full flex-col justify-end gap-2 p-6">
              <h3 className="font-heading text-xl tracking-wide uppercase">{program.title}</h3>
              <p className="text-sm text-muted-foreground">{program.body}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
