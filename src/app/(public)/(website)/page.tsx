"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { EvolutionSection } from "./_components/evolution-section";
import { FinalCtaSection } from "./_components/final-cta-section";
import { GuardrailsSection } from "./_components/guardrails-section";
import { HeroSection } from "./_components/hero-section";
import { ImpactSection } from "./_components/impact-section";
import { MarqueeTicker } from "./_components/marquee-ticker";
import { PlansSection } from "./_components/plans-section";
import { ProductShowcaseSection } from "./_components/product-showcase-section";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <main className="relative overflow-x-clip bg-[#06090D] text-arena-text">
      {/* Subtle tactical reading progress bar */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX }}
        className="fixed top-0 right-0 left-0 z-50 h-[2px] origin-left bg-linear-to-r from-arena-primary via-arena-info to-arena-highlight"
      />

      <HeroSection />
      <MarqueeTicker />
      <ImpactSection />
      <ProductShowcaseSection />
      <EvolutionSection />
      <PlansSection />
      <GuardrailsSection />
      <FinalCtaSection />
    </main>
  );
}
