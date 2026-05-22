"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type PrivacySection = {
  title: string;
  body: string;
};

export default function PrivacyPage() {
  const t = useTranslations("legal.privacy");
  const sections = t.raw("sections") as PrivacySection[];

  return (
    <main className="min-h-screen bg-[#0B0F14] pt-40 md:pt-48 pb-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Button
            variant="ghost"
            asChild
            className="mb-8 text-[#A7B0BE] hover:text-[#7CFF4F] hover:bg-[#1B2430] rounded-xl font-medium transition-all press"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 stroke-[1.7]" />
              {t("backHome")}
            </Link>
          </Button>

          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7CFF4F]/20 text-[#7CFF4F] border border-[#7CFF4F]/40 mb-6">
            <Shield className="h-6 w-6 stroke-[1.7]" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#F5F7FA] font-sora md:text-5xl lg:text-6xl mb-6 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-[#A7B0BE]">
            {t("subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-invert max-w-none space-y-6 text-[#A7B0BE]"
        >
          {sections.map((section, index) => (
            <section
              key={section.title}
              className="rounded-2xl border border-[#263244] bg-[#151C26] p-8 transition-all duration-200 hover:border-[#7CFF4F]/40 hover:bg-[#1B2430]"
            >
              <h2 className="text-xl md:text-2xl font-bold text-[#F5F7FA] font-sora mb-4 flex items-center gap-3">
                <span className="text-[#7CFF4F] text-lg font-mono">0{index + 1}.</span>
                {section.title}
              </h2>
              <p className="text-[#A7B0BE] leading-relaxed font-normal">
                {section.body}
              </p>
            </section>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
