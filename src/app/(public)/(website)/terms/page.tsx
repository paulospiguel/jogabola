"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type TermsSection = {
  title: string;
  body: string;
  items?: string[];
};

export default function TermsPage() {
  const t = useTranslations("legal.terms");
  const sections = t.raw("sections") as TermsSection[];

  return (
    <main className="min-h-screen bg-slate-950 pt-32 pb-20">
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
            className="mb-8 text-gray-400 hover:text-white"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("backHome")}
            </Link>
          </Button>

          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 mb-6">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl mb-6">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-400">{t("lastUpdated")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-invert max-w-none space-y-8 text-gray-300"
        >
          {sections.map((section, index) => (
            <section
              key={section.title}
              className={
                index === 0
                  ? "rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md"
                  : "p-4"
              }
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                {section.title}
              </h2>
              <p>{section.body}</p>
              {section.items && (
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  {section.items.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
