"use client";

import { motion } from "framer-motion";
import { ArrowRight, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useAnalytics } from "@/providers/analytics";
import { tacticalGridStyle } from "./section-shell";

const meshStyle = {
  backgroundImage: `
    radial-gradient(circle at 18% 22%, rgba(124,255,79,0.14) 0%, transparent 38%),
    radial-gradient(circle at 82% 15%, rgba(56,189,248,0.14) 0%, transparent 42%),
    radial-gradient(circle at 85% 88%, rgba(250,204,21,0.1) 0%, transparent 40%)
  `,
};

export function FinalCtaSection() {
  const t = useTranslations("homePage.finalCta");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { data: session } = useSession();
  const { logEvent } = useAnalytics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logEvent("landing_cta_clicked", undefined, {
      destination: "waitlist",
      location: "final_form",
    });
    if (email) {
      router.push(`/waitlist?email=${encodeURIComponent(email)}`);
    } else {
      router.push("/waitlist");
    }
  };

  return (
    <section className="relative overflow-hidden border-t border-arena-border bg-[#06090D] px-5 py-24 md:px-10 lg:px-16 lg:py-32">
      <div aria-hidden="true" className="absolute inset-0" style={meshStyle} />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-30"
        style={tacticalGridStyle}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto max-w-5xl text-center"
      >
        <div className="inline-flex rounded-full border border-arena-primary/35 bg-arena-primary/10 px-4 py-2 text-[11px] font-extrabold tracking-[0.14em] text-arena-primary uppercase">
          {t("badge")}
        </div>

        <h2 className="mx-auto mt-7 max-w-4xl font-sora text-4xl leading-[0.98] font-extrabold tracking-tight text-arena-text sm:text-6xl lg:text-[84px]">
          {t("headline")}{" "}
          <span className="text-arena-primary">{t("headlineAccent")}</span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-arena-text-sec md:text-lg">
          {t("subtitle")}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <Button
            asChild
            className="press h-13 rounded-full bg-arena-primary px-7 text-sm font-extrabold text-[#0B0F14] shadow-[0_0_32px_rgba(124,255,79,0.4)] hover:bg-arena-primary/90"
          >
            <Link
              href={session?.user ? "/arena" : "/auth"}
              onClick={() =>
                logEvent("landing_cta_clicked", undefined, {
                  destination: session?.user ? "arena" : "auth",
                  location: "final_primary",
                })
              }
            >
              {session?.user ? t("goToArena") : t("startFreeCta")}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="press h-13 rounded-full border border-arena-highlight/45 bg-arena-highlight/10 px-6 text-sm font-extrabold text-arena-highlight hover:bg-arena-highlight/20 hover:text-arena-highlight"
          >
            <Link href="/contact?plan=champion">
              <Crown className="mr-2 size-4" />
              {t("championCta")}
            </Link>
          </Button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex max-w-xl flex-col gap-2.5 rounded-[18px] border border-arena-border bg-arena-bg/75 p-2.5 backdrop-blur-xl sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            aria-label={t("emailLabel")}
            placeholder={t("emailPlaceholder")}
            className="min-h-12 flex-1 bg-transparent px-4 text-sm text-arena-text placeholder:text-arena-text-muted focus-visible:outline-none"
          />
          <Button
            type="submit"
            className="press h-12 rounded-xl border border-arena-primary/35 bg-arena-surface px-5 text-xs font-extrabold tracking-wider text-arena-primary uppercase hover:bg-arena-primary hover:text-[#0B0F14]"
          >
            {t("cta")}
          </Button>
        </form>
      </motion.div>
    </section>
  );
}
