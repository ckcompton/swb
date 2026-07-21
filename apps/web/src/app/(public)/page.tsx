import type { Metadata } from "next";
import { DESIGN_TOKENS } from "@boxing-gym/config";
import { HeroSection } from "@/components/site/hero-section";
import { ProgramsSection } from "@/components/site/programs-section";
import { CoachesSection } from "@/components/site/coaches-section";
import { SchedulePreviewSection } from "@/components/site/schedule-preview-section";
import { AboutSection } from "@/components/site/about-section";
import { ContactCtaSection } from "@/components/site/contact-cta-section";

export const metadata: Metadata = {
  title: "Home",
  description: `Train at ${DESIGN_TOKENS.siteName}. Classes for all levels, expert trainers, real results.`,
};

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <ProgramsSection />
      <CoachesSection />
      <SchedulePreviewSection />
      <AboutSection />
      <ContactCtaSection />
    </div>
  );
}
