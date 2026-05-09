"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileCheck2,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import confusedCapImg from "@/assets/images/jb-confused-cap.png";
import moneyImg from "@/assets/images/jb-money.png";
import receiptsImg from "@/assets/images/jb-receipts.png";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
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
      <div className="absolute inset-0 bg-linear-to-b from-arena-bg/20 via-arena-bg/60 to-arena-bg" />
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
      className="relative mx-auto max-w-md rounded-[18px] border border-arena-border bg-arena-surface p-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-arena-primary/[0.13] text-arena-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-arena-text uppercase">
              {t("title")}
            </h3>
            <p className="text-[10px] font-medium text-arena-text-muted">
              {t("kicker")}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="h-1 w-1 rounded-full bg-arena-border" />
          <div className="h-1 w-1 rounded-full bg-arena-border" />
          <div className="h-1 w-1 rounded-full bg-arena-border" />
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
              i === 3 ? "bg-arena-primary" : "bg-arena-primary/30",
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-arena-border pt-4">
        <div>
          <p className="text-[10px] font-bold tracking-tight text-arena-text-muted uppercase">
            {t("confirmed")}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="font-sora text-xl font-bold text-arena-text">14</span>
            <span className="text-xs text-arena-text-muted">{t("players")}</span>
          </div>
        </div>
        <div className="flex -space-x-2">
          <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-arena-bg bg-arena-info" />
          <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-arena-bg bg-arena-warning" />
          <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-arena-bg bg-arena-primary/80" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-arena-bg bg-arena-surface-el text-[10px] font-bold text-arena-text">
            +11
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const HeroSection = () => {
  const t = useTranslations("homePage.hero");
  const translation = useTranslations("header");

  const { data: session, isPending } = useSession();

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-arena-bg pt-20">
      <FieldPattern />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center rounded-full border border-arena-primary/20 bg-arena-primary/10 px-4 py-1.5">
              <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-arena-primary" />
              <span className="text-xs font-bold tracking-widest text-arena-primary uppercase">
                {t("badge")}
              </span>
            </div>

            <h1 className="font-sora text-4xl font-extrabold leading-tight text-arena-text md:text-5xl lg:text-6xl">
              {t("titlePart1")}
              <br />
              {t("titlePart2")}
              <br />
              <span className="text-arena-info">{t("titleHighlight")}</span>
              <br />
              {t("titlePart3")}
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-arena-text-sec md:text-xl">
              {t("description")}
            </p>

            <div className="pt-4">
              {!isPending && (
                <Button
                  asChild
                  className="rounded-xl px-8 py-7 text-lg font-bold shadow-xl transition-all hover:scale-105 hover:opacity-90"
                  style={{
                    backgroundColor: "#7CFF4F",
                    color: "#0B0F14",
                    boxShadow: "0 0 32px rgba(124,255,79,0.25)",
                  }}
                >
                  <Link href={session?.user ? "/arena" : "/auth"}>
                    {session?.user
                      ? t("goToArena")
                      : translation("launchJourney")}
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-20 rounded-full bg-arena-primary/5 blur-[100px]" />
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
    {
      id: "scheduled",
      icon: <span className="text-2xl">⚽</span>,
      label: t("item1"),
    },
    {
      id: "confirmed",
      icon: <CheckCircle2 className="h-6 w-6 text-arena-primary" />,
      label: t("item2"),
    },
    {
      id: "payments",
      icon: <CreditCard className="h-6 w-6 text-arena-info" />,
      label: t("item3"),
    },
  ];

  return (
    <div className="border-t border-b border-arena-border bg-arena-bg py-6">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              {item.icon}
              <span className="text-base font-bold text-arena-text">
                {item.label}
              </span>
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
      id: "attendance",
      image: confusedCapImg,
      alt: "confused captain",
      title: t("pain1.title"),
      description: t("pain1.description"),
      resolution: t("pain1.resolution"),
    },
    {
      id: "payments",
      image: moneyImg,
      alt: "money payment",
      title: t("pain2.title"),
      description: t("pain2.description"),
      resolution: t("pain2.resolution"),
    },
    {
      id: "proofs",
      image: receiptsImg,
      alt: "payment receipts",
      title: t("pain3.title"),
      description: t("pain3.description"),
      resolution: t("pain3.resolution"),
    },
  ];

  return (
    <section className="bg-arena-bg-sec py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold tracking-widest text-arena-primary uppercase">
            {t("kicker")}
          </p>
          <h2 className="font-sora text-4xl font-extrabold text-arena-text md:text-5xl">
            {t("title")}
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {pains.map((pain, i) => (
            <motion.div
              key={pain.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col rounded-[18px] border border-arena-border bg-arena-surface p-8"
            >
              <div className="mb-6 flex h-20 items-center">
                <Image
                  src={pain.image}
                  alt={pain.alt}
                  height={80}
                  className="object-contain"
                />
              </div>
              <h3 className="mb-3 text-lg font-bold text-arena-text">
                {pain.title}
              </h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-arena-text-sec">
                {pain.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-arena-info">
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
    {
      icon: Users,
      title: t("modules.teams.title"),
      description: t("modules.teams.description"),
    },
    {
      icon: CheckCircle2,
      title: t("modules.attendance.title"),
      description: t("modules.attendance.description"),
    },
    {
      icon: CreditCard,
      title: t("modules.payments.title"),
      description: t("modules.payments.description"),
    },
    {
      icon: FileCheck2,
      title: t("modules.proofs.title"),
      description: t("modules.proofs.description"),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-arena-bg py-32">
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-arena-primary/5 blur-[120px]" />
      <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-arena-primary/[0.03] blur-[120px]" />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-20 text-center">
          <h2 className="mb-4 text-sm font-bold tracking-widest text-arena-primary uppercase">
            {t("kicker")}
          </h2>
          <h1 className="font-sora mx-auto mb-6 max-w-3xl text-4xl font-extrabold text-arena-text md:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-arena-text-sec">
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
              className="group relative rounded-[18px] border border-arena-border bg-arena-surface p-8 backdrop-blur-md transition-all hover:border-arena-primary/[0.44] hover:bg-arena-surface-el"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-arena-info/[0.13] text-arena-info transition-transform group-hover:scale-110">
                <module.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-arena-text">
                {module.title}
              </h3>
              <p className="text-sm leading-relaxed text-arena-text-sec">
                {module.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const GooglePlayLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="122"
    height="24"
    viewBox="0 0 122 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M119.52 10.095L117.27 15.825H117.203L114.855 10.095H112.733L116.25 18.105L114.24 22.56H116.303L121.725 10.095H119.52ZM103.62 5.34001H101.655V18.555H103.62V5.34001ZM96.225 5.34001H91.5V18.555H93.48V13.5525H96.2325C96.7874 13.5715 97.3406 13.4801 97.86 13.2835C98.3793 13.087 98.8544 12.7892 99.2577 12.4075C99.661 12.0259 99.9845 11.5679 100.209 11.0602C100.434 10.5525 100.556 10.0052 100.568 9.45001C100.556 8.89388 100.434 8.34559 100.209 7.83697C99.9835 7.32835 99.6595 6.86954 99.2555 6.48718C98.8515 6.10481 98.3756 5.8065 97.8553 5.60957C97.3351 5.41264 96.7809 5.32102 96.225 5.34001ZM96.2775 11.7075H93.48V7.20751H96.285C96.8817 7.20751 97.454 7.44456 97.876 7.86652C98.298 8.28848 98.535 8.86077 98.535 9.45751C98.535 10.0542 98.298 10.6265 97.876 11.0485C97.454 11.4705 96.8817 11.7075 96.285 11.7075H96.2775ZM108.465 9.81001C107.745 9.76872 107.029 9.93831 106.404 10.298C105.78 10.6577 105.273 11.1919 104.948 11.835L106.703 12.585C106.876 12.267 107.139 12.0068 107.459 11.8362C107.779 11.6657 108.142 11.5923 108.503 11.625C108.75 11.6002 109.001 11.6246 109.239 11.6968C109.477 11.769 109.699 11.8877 109.891 12.0459C110.084 12.2041 110.243 12.3988 110.36 12.6187C110.477 12.8387 110.549 13.0795 110.573 13.3275V13.4625C109.944 13.1224 109.24 12.9445 108.525 12.945C106.643 12.945 104.723 13.98 104.723 15.945C104.723 17.715 106.26 18.855 108 18.855C108.495 18.8864 108.99 18.7831 109.431 18.5559C109.872 18.3288 110.243 17.9863 110.505 17.565H110.58V18.585H112.5V13.5C112.5 11.1525 110.745 9.84751 108.48 9.84751L108.465 9.81001ZM108.233 17.055C107.588 17.055 106.688 16.725 106.688 15.93C106.688 14.91 107.805 14.52 108.78 14.52C109.409 14.5032 110.031 14.656 110.58 14.9625C110.508 15.5361 110.23 16.064 109.798 16.4486C109.367 16.8333 108.811 17.0487 108.233 17.055ZM37.1175 18.84C35.2512 18.8462 33.4577 18.1167 32.1254 16.8098C30.7932 15.5028 30.0296 13.7236 30 11.8575C30.0296 9.99146 30.7932 8.21221 32.1254 6.90525C33.4577 5.59828 35.2512 4.86886 37.1175 4.87501C38.0068 4.8602 38.8901 5.02306 39.7156 5.35404C40.5411 5.68502 41.2923 6.17747 41.925 6.80251L40.5675 8.14501C39.6467 7.2428 38.4066 6.74134 37.1175 6.75001C35.7709 6.75001 34.4794 7.28496 33.5272 8.23718C32.575 9.18939 32.04 10.4809 32.04 11.8275C32.04 13.1741 32.575 14.4656 33.5272 15.4178C34.4794 16.3701 35.7709 16.905 37.1175 16.905C37.7728 16.9319 38.4265 16.821 39.0363 16.5794C39.6461 16.3378 40.1984 15.9709 40.6575 15.5025C41.2679 14.8444 41.6357 13.9978 41.7 13.1025H37.1175V11.25H43.5675C43.6378 11.6435 43.6705 12.0428 43.665 12.4425C43.7298 14.1028 43.1338 15.721 42.0075 16.9425C41.3716 17.5848 40.6075 18.0858 39.7649 18.4128C38.9223 18.7397 38.0202 18.8853 37.1175 18.84ZM53.64 14.34C53.6646 14.9399 53.5677 15.5386 53.3551 16.1002C53.1425 16.6617 52.8186 17.1744 52.4029 17.6076C51.9871 18.0408 51.4881 18.3855 50.9357 18.6209C50.3834 18.8564 49.7892 18.9778 49.1888 18.9778C48.5883 18.9778 47.9941 18.8564 47.4418 18.6209C46.8894 18.3855 46.3904 18.0408 45.9746 17.6076C45.5589 17.1744 45.235 16.6617 45.0224 16.1002C44.8098 15.5386 44.7129 14.9399 44.7375 14.34C44.7129 13.7401 44.8098 13.1414 45.0224 12.5799C45.235 12.0183 45.5589 11.5056 45.9746 11.0724C46.3904 10.6392 46.8894 10.2945 47.4418 10.0591C47.9941 9.82363 48.5883 9.70226 49.1888 9.70226C49.7892 9.70226 50.3834 9.82363 50.9357 10.0591C51.4881 10.2945 51.9871 10.6392 52.4029 11.0724C52.8186 11.5056 53.1425 12.0183 53.3551 12.5799C53.5677 13.1414 53.6646 13.7401 53.64 14.34ZM51.69 14.34C51.7231 13.9916 51.683 13.6401 51.5724 13.3081C51.4617 12.9761 51.2829 12.6709 51.0474 12.412C50.812 12.1531 50.525 11.9462 50.2049 11.8047C49.8848 11.6631 49.5387 11.59 49.1888 11.59C48.8388 11.59 48.4927 11.6631 48.1726 11.8047C47.8525 11.9462 47.5656 12.1531 47.3301 12.412C47.0946 12.6709 46.9158 12.9761 46.8051 13.3081C46.6945 13.6401 46.6544 13.9916 46.6875 14.34C46.6544 14.6884 46.6945 15.0399 46.8051 15.3719C46.9158 15.7039 47.0946 16.0092 47.3301 16.2681C47.5656 16.527 47.835 16.7338 48.1551 16.8754C48.4752 17.0169 48.8213 17.09 49.1712 17.09C49.5212 17.09 49.8673 17.0169 50.1874 16.8754C50.5075 16.7338 50.7945 16.527 51.0299 16.2681C51.2654 16.0092 51.4442 15.7039 51.5549 15.3719C51.6655 15.0399 51.7056 14.6884 51.69 14.34ZM63.615 14.34C63.615 15.5196 63.1464 16.6508 62.3124 17.4849C61.4783 18.3189 60.3471 18.7875 59.1675 18.7875C57.988 18.7875 56.8567 18.3189 56.0226 17.4849C55.1886 16.6508 54.72 15.5196 54.72 14.34C54.72 13.1605 55.1886 12.0292 56.0226 11.1952C56.8567 10.3611 57.988 9.89251 59.1675 9.89251C60.3471 9.89251 61.4783 10.3611 62.3124 11.1952C63.1464 12.0292 63.615 13.1605 63.615 14.34ZM61.6725 14.34C61.7056 13.9916 61.6655 13.6401 61.5549 13.3081C61.4442 12.9761 61.2654 12.6709 61.0299 12.412C60.7945 12.1531 60.5075 11.9462 60.1874 11.8047C59.8673 11.6631 59.5212 11.59 59.1712 11.59C58.8213 11.59 58.4752 11.6631 58.1551 11.8047C57.835 11.9462 57.5481 12.1531 57.3126 12.412C57.0771 12.6709 56.8983 12.9761 56.7876 13.3081C56.677 13.6401 56.6369 13.9916 56.67 14.34C56.6369 14.6884 56.677 15.0399 56.7876 15.3719C56.8983 15.7039 57.0771 16.0092 57.3126 16.2681C57.5481 16.527 57.835 16.7338 58.1551 16.8754C58.4752 17.0169 58.8213 17.09 59.1712 17.09C59.5212 17.09 59.8673 17.0169 60.1874 16.8754C60.5075 16.7338 60.7945 16.527 61.0299 16.2681C61.2654 16.0092 61.4442 15.7039 61.5549 15.3719C61.6655 15.0399 61.7056 14.6884 61.6725 14.34ZM73.35 10.1175V18.195C73.35 21.51 71.3775 22.875 69.0525 22.875C68.2003 22.8822 67.365 22.6367 66.6522 22.1695C65.9394 21.7023 65.381 21.0343 65.0475 20.25L66.75 19.5C66.9266 19.9579 67.2342 20.3536 67.6343 20.6377C68.0345 20.9218 68.5095 21.0818 69 21.0975C70.5 21.0975 71.415 20.175 71.415 18.4575V17.8125H71.34C71.0458 18.1408 70.6848 18.4023 70.2812 18.5795C69.8776 18.7567 69.4408 18.8456 69 18.84C67.8065 18.84 66.6619 18.3659 65.818 17.522C64.9741 16.6781 64.5 15.5335 64.5 14.34C64.5 13.1465 64.9741 12.0019 65.818 11.158C66.6619 10.3141 67.8065 9.84001 69 9.84001C69.4437 9.83024 69.8844 9.91478 70.2929 10.088C70.7015 10.2613 71.0686 10.5193 71.37 10.845H71.445V10.095H73.35V10.1175ZM71.6025 14.3625C71.6301 14.0231 71.5891 13.6816 71.4822 13.3583C71.3752 13.0349 71.2044 12.7364 70.9798 12.4804C70.7553 12.2244 70.4816 12.0161 70.175 11.8678C69.8684 11.7196 69.5351 11.6345 69.195 11.6175C68.8482 11.629 68.5072 11.7095 68.1919 11.8543C67.8767 11.9992 67.5934 12.2054 67.3588 12.461C67.1241 12.7166 66.9428 13.0164 66.8254 13.3429C66.708 13.6694 66.6569 14.016 66.675 14.3625C66.6589 14.7067 66.7117 15.0506 66.8303 15.374C66.9489 15.6975 67.1309 15.994 67.3656 16.2462C67.6004 16.4984 67.8831 16.7012 68.1972 16.8426C68.5114 16.9841 68.8506 17.0614 69.195 17.07C69.5331 17.0569 69.8651 16.9757 70.171 16.8311C70.4769 16.6866 70.7505 16.4818 70.9753 16.2289C71.2001 15.9761 71.3716 15.6804 71.4794 15.3597C71.5871 15.039 71.629 14.6998 71.6025 14.3625ZM76.8225 5.35501V18.5625H74.8425V5.35501H76.8225ZM84.6225 15.825L86.1675 16.845C85.755 17.4606 85.1969 17.9648 84.5427 18.3128C83.8885 18.6608 83.1585 18.8419 82.4175 18.84C81.828 18.8484 81.243 18.7372 80.6978 18.513C80.1526 18.2887 79.6585 17.9562 79.2456 17.5355C78.8326 17.1148 78.5093 16.6147 78.2952 16.0655C78.0811 15.5162 77.9807 14.9292 78 14.34C77.9122 13.3271 78.2002 12.3173 78.8091 11.5031C79.4181 10.6889 80.3053 10.1272 81.3017 9.92512C82.2982 9.72305 83.3341 9.89471 84.2121 10.4074C85.0901 10.9201 85.7488 11.7379 86.0625 12.705L86.265 13.2225L80.265 15.705C80.452 16.1252 80.7605 16.4799 81.1508 16.7231C81.5411 16.9664 81.9954 17.0872 82.455 17.07C82.8922 17.0632 83.3205 16.9453 83.6996 16.7275C84.0787 16.5098 84.3963 16.1992 84.6225 15.825ZM79.89 14.205L83.925 12.54C83.7688 12.2343 83.5264 11.9812 83.2278 11.8119C82.9292 11.6426 82.5875 11.5646 82.245 11.5875C81.9175 11.6018 81.5962 11.6813 81.2997 11.8211C81.0033 11.961 80.7377 12.1586 80.5185 12.4023C80.2992 12.646 80.1307 12.9309 80.0228 13.2404C79.9149 13.5499 79.8698 13.8778 79.89 14.205Z"
      fill="#5F6368"
    />
    <path
      d="M10.1548 11.46L0.0898438 22.005C0.20286 22.4056 0.405967 22.775 0.683638 23.085C0.961309 23.3951 1.30619 23.6375 1.69192 23.7938C2.07765 23.9502 2.49402 24.0162 2.90919 23.987C3.32436 23.9577 3.72735 23.8339 4.08734 23.625L15.4123 17.175L10.1548 11.46Z"
      fill="#EA4335"
    />
    <path
      d="M20.3319 9.66752L15.4344 6.86252L9.92188 11.7L15.4569 17.16L20.3169 14.385C20.7474 14.1596 21.1081 13.8206 21.3597 13.4048C21.6114 12.989 21.7444 12.5123 21.7444 12.0263C21.7444 11.5403 21.6114 11.0635 21.3597 10.6477C21.1081 10.2319 20.7474 9.89295 20.3169 9.66752H20.3319Z"
      fill="#FBBC04"
    />
    <path
      d="M0.0900296 1.99503C0.0291888 2.21994 -0.00108333 2.45203 2.96038e-05 2.68503V21.315C0.000638139 21.5479 0.0308811 21.7798 0.0900296 22.005L10.5 11.73L0.0900296 1.99503Z"
      fill="#4285F4"
    />
    <path
      d="M10.2298 12L15.4348 6.8625L4.12484 0.382505C3.69936 0.133311 3.21543 0.00133038 2.72234 5.3641e-06C2.12683 -0.00117477 1.54726 0.192401 1.07199 0.551225C0.596717 0.910049 0.25181 1.41444 0.0898438 1.98751L10.2298 12Z"
      fill="#34A853"
    />
  </svg>
);

const AppStoreLogo = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn("inline-flex items-center gap-2", className)}
  >
    <span className="flex size-6 items-center justify-center rounded-md bg-[#1A9FFF] text-white">
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M7.31 2.32c.27-.47.88-.63 1.35-.36.47.27.63.88.36 1.35L4.23 11.6h2.6l1.1-1.9 1.14 1.9h.9c.55 0 1 .45 1 1s-.45 1-1 1H2.48c-.55 0-1-.45-1-1s.45-1 1-1h.44l4.39-9.28Z"
          fill="currentColor"
        />
        <path
          d="M10.7 8.05 8.96 5.06l1.14-1.98c.27-.47.88-.63 1.35-.36.47.27.63.88.36 1.35l-.7 1.21 4.32 7.48c.27.47.11 1.08-.36 1.35-.47.27-1.08.11-1.35-.36L11.86 10.5l-1.16-2.45Z"
          fill="currentColor"
        />
        <path
          d="M3.02 15.48c-.47-.27-.63-.88-.36-1.35l.86-1.48h2.31l-1.46 2.47c-.28.47-.88.63-1.35.36Z"
          fill="currentColor"
        />
      </svg>
    </span>
    <span className="whitespace-nowrap text-[20px] font-extrabold leading-none tracking-normal text-[#0C1020]">
      App Store
    </span>
  </span>
);

const PlatformLogo = ({
  platform,
  className,
}: {
  platform: "appStore" | "googlePlay";
  className?: string;
}) => {
  if (platform === "appStore") {
    return <AppStoreLogo className={className} />;
  }

  return <GooglePlayLogo className={className} />;
};

const CommunityReviewsSection = () => {
  const t = useTranslations("homePage.communityReviews");
  const reviewsRef = useRef<HTMLDivElement>(null);

  const reviews = [
    {
      key: "sarah",
      platform: "googlePlay",
      accent: "text-arena-primary",
    },
    {
      key: "bruno",
      platform: "appStore",
      accent: "text-arena-info",
    },
    {
      key: "mina",
      platform: "googlePlay",
      accent: "text-arena-primary",
    },
    {
      key: "subbo",
      platform: "appStore",
      accent: "text-arena-info",
    },
  ];

  const scrollReviews = (direction: "previous" | "next") => {
    reviewsRef.current?.scrollBy({
      left: direction === "previous" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const platforms = [
    {
      key: "appStore",
      platform: "appStore" as const,
    },
    {
      key: "googlePlay",
      platform: "googlePlay" as const,
    },
  ];

  return (
    <section
      id="community-reviews"
      className="relative scroll-mt-28 overflow-hidden bg-arena-bg py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-[18%] h-72 w-72 rounded-full bg-arena-info/[0.08] blur-[110px]" />
        <div className="absolute right-[14%] bottom-12 h-80 w-80 rounded-full bg-arena-primary/[0.08] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-4xl text-center">
          <p className="mb-3 text-xs font-bold tracking-widest text-arena-primary uppercase">
            {t("kicker")}
          </p>
          <h2 className="font-sora text-4xl font-extrabold tracking-normal text-arena-text md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-arena-text-sec md:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mb-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {platforms.map(platform => (
            <div
              key={platform.key}
              className="flex min-h-12 items-center gap-4 rounded-full border border-arena-border bg-white/92 px-5 text-[#0C1020] shadow-[0_18px_45px_-30px_rgba(36,255,230,0.5)] backdrop-blur-md"
            >
              <PlatformLogo
                platform={platform.platform}
                className="h-6 min-w-[132px] shrink-0"
              />
              <span className="flex items-center gap-0.5 text-arena-primary">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={`${platform.key}-star-${index}`}
                    className="size-4"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                ))}
              </span>
            </div>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label={t("previous")}
            onClick={() => scrollReviews("previous")}
            className="absolute top-1/2 -left-2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-arena-border bg-arena-surface text-arena-text shadow-[0_18px_45px_-28px_rgba(2,167,255,0.35)] backdrop-blur-md transition-all hover:border-arena-primary/[0.44] hover:bg-arena-surface-el lg:flex"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div
            ref={reviewsRef}
            className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4"
          >
            {reviews.map((review, index) => (
              <motion.article
                key={review.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="min-w-[280px] snap-center rounded-[18px] border border-arena-border bg-arena-surface p-6 backdrop-blur-md transition-all hover:border-arena-primary/[0.44] hover:bg-arena-surface-el md:min-w-0"
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1 text-arena-primary">
                    {Array.from({ length: 5 }, (_, starIndex) => (
                      <Star
                        key={`${review.key}-${starIndex}`}
                        className="size-5"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <span className="shrink-0 text-xs font-medium leading-snug text-arena-text-muted">
                    {t(`items.${review.key}.date`)}
                  </span>
                </div>

                <h3 className="mb-3 text-lg font-bold leading-snug text-arena-text">
                  {t(`items.${review.key}.name`)}
                </h3>
                <p className="mb-7 line-clamp-5 text-sm leading-relaxed text-arena-text-sec">
                  {t(`items.${review.key}.text`)}
                </p>

                <div className="inline-flex w-fit items-center rounded-full bg-white/92 px-3 py-2">
                  <PlatformLogo
                    platform={review.platform as "appStore" | "googlePlay"}
                    className="h-6 min-w-[132px]"
                  />
                </div>
              </motion.article>
            ))}
          </div>

          <button
            type="button"
            aria-label={t("next")}
            onClick={() => scrollReviews("next")}
            className="absolute top-1/2 -right-2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-arena-border bg-arena-surface text-arena-text shadow-[0_18px_45px_-28px_rgba(2,167,255,0.35)] backdrop-blur-md transition-all hover:border-arena-primary/[0.44] hover:bg-arena-surface-el lg:flex"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            asChild
            className="rounded-xl bg-arena-primary px-8 py-6 text-base font-bold text-[#0B0F14] transition-all hover:scale-105 hover:opacity-90"
            style={{ boxShadow: "0 0 32px rgba(124,255,79,0.2)" }}
          >
            <Link href="/waitlist">{t("cta")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const WaitlistCtaSection = () => {
  const t = useTranslations("homePage.waitlistCta");

  return (
    <section className="relative overflow-hidden bg-arena-bg-sec py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-arena-primary/5 blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-2xl px-4 text-center md:px-6">
        <div className="mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-arena-primary/20 bg-arena-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-arena-primary uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-arena-primary" />
            {t("badge")}
          </span>
        </div>

        <h2 className="font-sora mb-4 text-4xl font-extrabold text-arena-text md:text-5xl">
          {t("titlePart1")}
          <br />
          {t("titlePart2")}
        </h2>

        <p className="mb-10 text-lg text-arena-text-sec">{t("subtitle")}</p>

        <Button
          asChild
          className="rounded-xl px-10 py-7 text-lg font-bold transition-all hover:scale-105 hover:opacity-90"
          style={{
            backgroundColor: "#7CFF4F",
            color: "#0B0F14",
            boxShadow: "0 0 32px rgba(124,255,79,0.25)",
          }}
        >
          <Link href="/waitlist">{t("cta")}</Link>
        </Button>

        <p className="mt-6 text-sm text-arena-text-muted">
          {t("alreadyHaveAccess")}{" "}
          <Link
            href="/auth"
            className="text-arena-text-sec underline underline-offset-2 transition-colors hover:text-arena-text"
          >
            {t("signIn")}
          </Link>
        </p>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <main className="relative bg-arena-bg">
      <HeroSection />
      <MomentumStrip />
      <ProblemsSection />
      <EcosystemSection />
      <CommunityReviewsSection />
      <WaitlistCtaSection />
    </main>
  );
}
