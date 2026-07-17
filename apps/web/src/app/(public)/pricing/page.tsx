import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Membership pricing at the gym. Simple plans, no hidden fees.",
};

const PLANS = [
  {
    name: "Drop-In",
    price: "$25",
    period: "per class",
    description: "Try a class before committing to a membership.",
    features: ["Access to any single class", "No commitment", "Pay as you go"],
    highlighted: false,
  },
  {
    name: "Monthly Unlimited",
    price: "$120",
    period: "per month",
    description: "Unlimited classes, our most popular plan.",
    features: [
      "Unlimited class bookings",
      "Priority booking window",
      "Access to all trainers",
      "Cancel anytime",
    ],
    highlighted: true,
  },
  {
    name: "Annual Unlimited",
    price: "$1,100",
    period: "per year",
    description: "Best value for committed members.",
    features: [
      "Unlimited class bookings",
      "Priority booking window",
      "Access to all trainers",
      "Two months free vs. monthly",
    ],
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Membership pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Straightforward plans. No contracts, no surprise fees. Sign up and an admin will activate
          your membership.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.highlighted ? "border-primary" : undefined}>
            <CardHeader>
              {plan.highlighted && (
                <Badge className="mb-2 w-fit bg-gold text-gold-foreground hover:bg-gold">
                  Most popular
                </Badge>
              )}
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                <span className="text-3xl font-bold">{plan.price}</span>{" "}
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span aria-hidden className="mt-0.5 text-gold">
                      &bull;
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                render={<Link href="/signup">Sign up</Link>}
                nativeButton={false}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Pricing is informational. After signing up, a staff member will activate your membership
        plan at the front desk.
      </p>
    </div>
  );
}
