"use client";

import { motion } from "framer-motion";
import { Gauge, History, Lock, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading, SectionShell } from "./section-shell";

interface GuardrailItem {
  tag: string;
  title: string;
  description: string;
}

const GUARDRAIL_ICONS = [ShieldCheck, Lock, Gauge, History] as const;

export function GuardrailsSection() {
  const t = useTranslations("homePage.guardrails");
  const items = t.raw("items") as GuardrailItem[];

  return (
    <SectionShell id="controlo" number="05" label={t("kicker")}>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <SectionHeading>
          {t("titlePrefix")}{" "}
          <span className="text-arena-primary">{t("titleAccent")}</span>
        </SectionHeading>
        <p className="max-w-xl text-base leading-7 text-arena-text-sec">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = GUARDRAIL_ICONS[index] ?? ShieldCheck;
          return (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              className="group flex flex-col justify-between rounded-[20px] border border-arena-border bg-arena-surface/85 p-6 transition-colors hover:border-arena-primary/40 hover:bg-arena-surface-el"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-arena-primary/30 bg-arena-primary/10 text-arena-primary">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[10px] font-extrabold tracking-widest text-arena-text-muted uppercase">
                    {item.tag}
                  </span>
                </div>

                <h3 className="mt-5 font-sora text-lg font-extrabold text-arena-text">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-xs leading-6 text-arena-text-sec md:text-sm">
                  {item.description}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </SectionShell>
  );
}
