"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import confusedCapImg from "@/assets/images/jb-confused-cap.png";
import moneyImg from "@/assets/images/jb-money.png";
import receiptsImg from "@/assets/images/jb-receipts.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DASHBOARD_BARS = [
  { id: "confirmed", height: 65 },
  { id: "reserved", height: 90 },
  { id: "waiting", height: 45 },
  { id: "paid", height: 80 },
  { id: "proofs", height: 55 },
  { id: "pending", height: 35 },
];

const FieldPattern = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center brightness-[0.3]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2693&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-slate-950/20 via-slate-900/60 to-slate-950" />
    </div>
  );
};

const DashboardCard = () => {
  const t = useTranslations("homePage.dashboard");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">
              {t("title")}
            </h3>
            <p className="text-[10px] font-medium text-gray-400">
              {t("kicker")}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="h-1 w-1 rounded-full bg-gray-500" />
          <div className="h-1 w-1 rounded-full bg-gray-500" />
          <div className="h-1 w-1 rounded-full bg-gray-500" />
        </div>
      </div>

      <div className="mb-8 flex h-32 items-end justify-between gap-2 px-2">
        {DASHBOARD_BARS.map((bar, i) => (
          <motion.div
            key={bar.id}
            initial={{ height: 0 }}
            animate={{ height: `${bar.height}%` }}
            transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
            className={cn(
              "w-full rounded-t-md",
              i === 3 ? "bg-blue-500" : "bg-blue-500/30",
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <p className="text-[10px] font-bold tracking-tight text-gray-400 uppercase">
            {t("confirmed")}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">14</span>
            <span className="text-xs text-gray-400">{t("players")}</span>
          </div>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-8 w-8 overflow-hidden rounded-full border-2 border-slate-900 bg-gray-700"
            >
              <div className="h-full w-full bg-linear-to-br from-blue-400 to-emerald-400" />
            </div>
          ))}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 text-[10px] font-bold text-white">
            +11
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const HeroSection = () => {
  const t = useTranslations("homePage.hero");

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-slate-950 pt-20">
      <FieldPattern />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center rounded-full border border-[#7CFF4F]/20 bg-[#7CFF4F]/10 px-4 py-1.5">
              <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-[#7CFF4F]" />
              <span className="text-xs font-bold tracking-widest text-[#7CFF4F] uppercase">
                {t("badge")}
              </span>
            </div>

            <h1 className="text-5xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl">
              {t("titlePart1")}
              <br />
              {t("titlePart2")}
              <br />
              <span className="text-blue-500">{t("titleHighlight")}</span>
              <br />
              {t("titlePart3")}
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-gray-400 md:text-xl">
              {t("description")}
            </p>

            <div className="pt-4">
              <Button
                asChild
                className="rounded-full px-8 py-7 text-lg font-bold shadow-xl transition-all hover:scale-105"
                style={{ backgroundColor: "#7CFF4F", color: "#000" }}
              >
                <Link href="/waitlist">
                  {t("joinWaitlist")}
                </Link>
              </Button>
            </div>
          </motion.div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-20 rounded-full bg-blue-500/10 blur-[100px]" />
            <DashboardCard />
          </div>
        </div>
      </div>
    </section>
  );
};

const MomentumStrip = () => {
  const t = useTranslations("homePage.momentumStrip");

  const items = [
    { icon: <span className="text-2xl">⚽</span>, label: t("item1") },
    { icon: <CheckCircle2 className="h-6 w-6 text-[#7CFF4F]" />, label: t("item2") },
    { icon: <CreditCard className="h-6 w-6 text-blue-400" />, label: t("item3") },
  ];

  return (
    <div className="border-t border-b border-white/5 bg-slate-950 py-6">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.icon}
              <span className="text-base font-bold text-white">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProblemsSection = () => {
  const t = useTranslations("homePage.problems");

  const pains = [
    {
      image: confusedCapImg,
      alt: "confused captain",
      title: t("pain1.title"),
      description: t("pain1.description"),
      resolution: t("pain1.resolution"),
    },
    {
      image: moneyImg,
      alt: "money payment",
      title: t("pain2.title"),
      description: t("pain2.description"),
      resolution: t("pain2.resolution"),
    },
    {
      image: receiptsImg,
      alt: "payment receipts",
      title: t("pain3.title"),
      description: t("pain3.description"),
      resolution: t("pain3.resolution"),
    },
  ];

  return (
    <section className="bg-slate-900 py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold tracking-widest text-blue-500 uppercase">
            {t("kicker")}
          </p>
          <h2 className="text-4xl font-extrabold text-white md:text-5xl">
            {t("title")}
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {pains.map((pain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col rounded-3xl border border-white/5 bg-white/5 p-8"
            >
              <div className="mb-6 flex h-20 items-center">
                <Image
                  src={pain.image}
                  alt={pain.alt}
                  height={80}
                  className="object-contain"
                />
              </div>
              <h3 className="mb-3 text-lg font-bold text-white">{pain.title}</h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-400">
                {pain.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <ArrowRight className="h-3 w-3 shrink-0" />
                {pain.resolution}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const EcosystemSection = () => {
  const t = useTranslations("homePage.ecosystem_section");

  const modules = [
    { icon: Users, title: t("modules.teams.title"), description: t("modules.teams.description") },
    { icon: CheckCircle2, title: t("modules.attendance.title"), description: t("modules.attendance.description") },
    { icon: CreditCard, title: t("modules.payments.title"), description: t("modules.payments.description") },
    { icon: FileCheck2, title: t("modules.proofs.title"), description: t("modules.proofs.description") },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-32">
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-emerald-600/5 blur-[120px]" />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-20 text-center">
          <h2 className="mb-4 text-sm font-bold tracking-widest text-blue-500 uppercase">
            {t("kicker")}
          </h2>
          <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-extrabold text-white md:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md transition-all hover:border-white/10 hover:bg-white/10"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 transition-transform group-hover:scale-110">
                <module.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-white">{module.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{module.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WaitlistCtaSection = () => {
  const t = useTranslations("homePage.waitlistCta");

  return (
    <section className="relative overflow-hidden bg-slate-900 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7CFF4F]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-2xl px-4 text-center md:px-6">
        <div className="mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#7CFF4F]/20 bg-[#7CFF4F]/10 px-4 py-1.5 text-xs font-bold tracking-widest text-[#7CFF4F] uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7CFF4F]" />
            {t("badge")}
          </span>
        </div>

        <h2 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
          {t("titlePart1")}
          <br />
          {t("titlePart2")}
        </h2>

        <p className="mb-10 text-lg text-gray-400">{t("subtitle")}</p>

        <Button
          asChild
          className="rounded-full px-10 py-7 text-lg font-bold shadow-xl transition-all hover:scale-105"
          style={{ backgroundColor: "#7CFF4F", color: "#000" }}
        >
          <Link href="/waitlist">{t("cta")}</Link>
        </Button>

        <p className="mt-6 text-sm text-white/30">
          {t("alreadyHaveAccess")}{" "}
          <Link href="/auth" className="text-white/50 underline underline-offset-2 transition-colors hover:text-white/70">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <main className="relative bg-slate-950">
      <HeroSection />
      <MomentumStrip />
      <ProblemsSection />
      <EcosystemSection />
      <WaitlistCtaSection />
    </main>
  );
}
