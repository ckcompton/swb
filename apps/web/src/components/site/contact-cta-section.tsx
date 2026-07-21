import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Placeholder contact details — swap in the gym's real address/phone/email.
const CONTACT = {
  address: ["123 Ring Side Ave", "Your City, ST 00000"],
  phone: "555-000-0000",
  email: "info@shadowworkboxing.com",
};

export function ContactCtaSection() {
  return (
    <section id="contact" className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="font-heading text-3xl font-bold tracking-tight uppercase sm:text-4xl">
            Ready to step out of the <span className="text-gold">shadows?</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Create an account, browse the schedule, and book your first class today.
          </p>
          <Button
            size="lg"
            className="mt-6 h-12 px-8 text-base"
            render={<Link href="/signup">Book your session</Link>}
            nativeButton={false}
          />
        </div>
        <dl className="grid gap-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-gold" />
            <dd>
              {CONTACT.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <Phone aria-hidden className="size-5 shrink-0 text-gold" />
            <dd>{CONTACT.phone}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Mail aria-hidden className="size-5 shrink-0 text-gold" />
            <dd>{CONTACT.email}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
