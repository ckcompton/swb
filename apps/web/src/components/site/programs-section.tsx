import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PROGRAMS = [
  {
    title: "Youth Boxing",
    body: "Build confidence, discipline, and strong fundamentals in a safe, structured environment.",
  },
  {
    title: "Adult Training",
    body: "Get in shape, learn real skills, and train with purpose alongside a committed community.",
  },
  {
    title: "Personal Coaching",
    body: "Customized training built around your goals, one-on-one with our coaching staff.",
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
          <Card key={program.title} className="border-border/60">
            <CardHeader>
              <CardTitle className="font-heading text-xl tracking-wide uppercase">
                {program.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{program.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
