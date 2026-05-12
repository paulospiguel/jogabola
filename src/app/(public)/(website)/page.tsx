"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Receipt,
  Star,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ComponentType, useState } from "react";
import { DemoModal } from "@/components/demo/demo-modal";
import {
  PhoneMockup,
  type PhoneScreen,
} from "@/components/landing/phone-mockup";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Problem = {
  title: string;
  description: string;
  resolution: string;
};

type Step = {
  title: string;
  description: string;
};

type Feature = Step & {
  icon: ComponentType<{ className?: string }>;
};

type JourneyStep = Step & {
  label: string;
  screen: PhoneScreen;
};

type Testimonial = {
  name: string;
  role: string;
  text: string;
};

const fadeUp = {
  initial: false,
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

const textStroke = (color = "rgba(245,247,250,.88)", width = 1.5) => ({
  color: "transparent",
  WebkitTextStroke: `${width}px ${color}`,
});

const meshStyle = {
  backgroundImage: `
    radial-gradient(circle at 15% 20%, rgba(124,255,79,.13) 0%, transparent 35%),
    radial-gradient(circle at 85% 5%, rgba(56,189,248,.13) 0%, transparent 40%),
    radial-gradient(circle at 90% 90%, rgba(124,255,79,.08) 0%, transparent 45%),
    radial-gradient(circle at 5% 90%, rgba(245,158,11,.08) 0%, transparent 40%)
  `,
};

const gridStyle = {
  backgroundImage:
    "linear-gradient(rgba(38,50,68,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(38,50,68,.35) 1px, transparent 1px)",
  backgroundSize: "80px 80px",
  maskImage: "radial-gradient(circle at center, black 30%, transparent 80%)",
  WebkitMaskImage:
    "radial-gradient(circle at center, black 30%, transparent 80%)",
};

const MotionSection = ({
  number,
  label,
  children,
  className,
}: {
  number: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={cn(
      "relative overflow-hidden border-t border-arena-border bg-[#06090D] px-5 py-20 md:px-10 lg:px-20 lg:py-35",
      className,
    )}
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-24 right-6 hidden font-sora text-[220px] font-extrabold leading-none text-transparent opacity-70 lg:block"
      style={{
        WebkitTextStroke: "1px rgba(38,50,68,.95)",
        letterSpacing: "-8px",
      }}
    >
      {number}
    </div>
    <div className="relative mx-auto max-w-7xl">
      <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-arena-primary/35 bg-arena-primary/10 px-4 py-2">
        <span className="size-1.5 rounded-full bg-arena-primary" />
        <span className="text-[11px] font-extrabold tracking-[0.14em] text-arena-primary uppercase">
          {number} · {label}
        </span>
      </div>
      {children}
    </div>
  </section>
);

const SectionTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h2
    className={cn(
      "font-sora max-w-5xl text-5xl leading-[0.95] font-extrabold tracking-normal text-arena-text md:text-7xl lg:text-8xl",
      className,
    )}
  >
    {children}
  </h2>
);

const HeroSection = () => {
  const t = useTranslations("homePage.hero");
  const headerT = useTranslations("header");
  const { data: session } = useSession();

  const ctaHref = session?.user ? "/arena" : "/auth";
  const ctaLabel = session?.user ? t("goToArena") : headerT("launchJourney");

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#06090D] px-5 pt-28 pb-10 md:px-10 lg:px-20 lg:pt-32">
      <div className="absolute inset-0" style={meshStyle} />
      <div className="absolute inset-0 opacity-40" style={gridStyle} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -left-5 hidden font-sora text-[260px] leading-[0.8] font-extrabold whitespace-nowrap text-transparent opacity-60 lg:block"
        style={{
          WebkitTextStroke: "1px rgba(124,255,79,.14)",
          letterSpacing: "-10px",
        }}
      >
        jogabola
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="inline-flex items-center gap-3 rounded-full border border-arena-primary/40 bg-arena-bg/60 px-4 py-2 backdrop-blur-xl">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-2 animate-[pulseDot_1.8s_ease-in-out_infinite] rounded-full bg-arena-primary" />
            <span className="relative inline-flex size-2 rounded-full bg-arena-primary" />
          </span>
          <span className="text-[11px] font-extrabold tracking-[0.14em] text-arena-primary uppercase">
            {t("badge")}
          </span>
        </div>

        <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.45fr_1fr]">
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75 }}
          >
            <h1 className="font-sora text-[60px] leading-[0.9] font-extrabold tracking-normal text-arena-text md:text-[112px] lg:text-[168px]">
              <span>{t("headline.play")} </span>
              <span className="italic" style={textStroke()}>
                {t("headline.more")}
              </span>
              <br />
              <span className="bg-linear-to-r from-arena-primary to-arena-info bg-clip-text text-transparent">
                {t("headline.organize")}
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-arena-text-sec md:text-xl">
              {t("description")}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-arena-primary px-6 py-6 text-sm font-extrabold text-[#0B0F14] shadow-[0_0_32px_rgba(124,255,79,.45)] hover:bg-arena-primary/90"
              >
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <DemoModal
                label={t("secondaryCta")}
                className="inline-flex items-center rounded-full border border-arena-border bg-arena-bg/60 px-6 py-3.5 text-sm font-bold text-arena-text backdrop-blur-xl hover:bg-arena-surface transition-colors"
              />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4 rounded-[14px] border border-arena-border bg-arena-bg/45 p-4 backdrop-blur-md">
              <span className="size-2 rounded-full bg-arena-primary shadow-[0_0_12px_rgba(124,255,79,.9)] animate-[pulseDot_1.6s_ease-in-out_infinite]" />
              <p className="text-xs font-semibold text-arena-text-sec">
                <strong className="text-arena-text">{t("tickerStrong")}</strong>{" "}
                {t("ticker")}
              </p>
              <div className="ml-auto flex">
                {["SF", "BR", "MA", "AS", "JM"].map((avatar, index) => (
                  <span
                    key={avatar}
                    className="-ml-2 flex size-7 items-center justify-center rounded-full border-2 border-arena-bg text-[9px] font-extrabold text-[#0B0F14] first:ml-0"
                    style={{
                      background: `oklch(58% 0.13 ${[10, 130, 200, 260, 55][index]})`,
                    }}
                  >
                    {avatar}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1, rotate: -4, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden justify-center lg:flex"
          >
            <div className="absolute top-16 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-arena-primary/25 blur-[36px]" />
            <PhoneMockup scale={1.05} screen="team" className="relative z-10" />
            <div className="absolute top-20 -left-8 z-20 rotate-[-6deg] rounded-[14px] border border-arena-primary/35 bg-arena-bg/80 px-4 py-3 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 text-sm font-extrabold text-arena-text">
                <CheckCircle2 className="size-4 text-arena-primary" />
                {t("badgeConfirmed")}
              </div>
            </div>
            <div className="absolute right-0 bottom-24 z-20 rotate-[4deg] rounded-[14px] border border-arena-border bg-arena-bg/85 px-5 py-4 shadow-2xl backdrop-blur-xl">
              <div className="font-sora text-3xl font-extrabold text-arena-primary">
                55€
              </div>
              <div className="text-xs font-bold text-arena-text-sec">
                {t("badgePaid")}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Marquee = () => {
  const t = useTranslations("homePage.marquee");
  const items = t.raw("items") as string[];
  const repeated = Array.from({ length: 4 }, (_, repeatIndex) =>
    items.map(item => ({ item, repeatIndex })),
  ).flat();

  return (
    <div className="overflow-hidden border-y border-arena-border bg-[#06090D] py-6">
      <div className="flex w-max gap-12 whitespace-nowrap animate-[marqueeScroll_36s_linear_infinite]">
        {repeated.map(({ item, repeatIndex }, index) => (
          <div
            key={`${repeatIndex}-${item}`}
            className="flex items-center gap-12"
          >
            <span
              className="font-sora text-2xl font-extrabold tracking-normal md:text-4xl"
              style={
                index % 2 ? textStroke("rgba(245,247,250,.7)", 1) : undefined
              }
            >
              {item}
            </span>
            <span className="size-2 rounded-full bg-arena-primary" />
          </div>
        ))}
      </div>
    </div>
  );
};

const ProblemsSection = () => {
  const t = useTranslations("homePage.problems");
  const problems = t.raw("items") as Problem[];

  return (
    <MotionSection number="01" label={t("kicker")}>
      <SectionTitle>
        {t("titlePrefix")}{" "}
        <span
          className="italic"
          style={textStroke("rgba(245,247,250,.86)", 1.5)}
        >
          {t("titleStroke")}
        </span>
      </SectionTitle>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {problems.map((problem, index) => (
          <motion.article
            key={problem.title}
            {...fadeUp}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative overflow-hidden rounded-[8px] border border-arena-border bg-arena-surface/90 p-7 backdrop-blur-md md:[transform:translateY(var(--lift))]"
            style={{ "--lift": `${index * 20}px` } as React.CSSProperties}
          >
            <div
              aria-hidden="true"
              className="absolute -top-5 right-3 font-sora text-[110px] font-extrabold leading-none text-transparent opacity-40"
              style={{ WebkitTextStroke: "1px rgba(124,255,79,.35)" }}
            >
              0{index + 1}
            </div>
            <h3 className="relative font-sora text-2xl font-extrabold text-arena-text">
              {problem.title}
            </h3>
            <p className="relative mt-5 text-sm leading-7 text-arena-text-sec">
              {problem.description}
            </p>
            <div className="relative mt-8 flex items-center gap-3 rounded-[8px] border border-arena-primary/25 bg-arena-primary/10 p-3 text-xs font-extrabold text-arena-primary">
              <Zap className="size-4 shrink-0" />
              {problem.resolution}
            </div>
          </motion.article>
        ))}
      </div>
    </MotionSection>
  );
};

const HowSection = () => {
  const t = useTranslations("homePage.how");
  const steps = t.raw("steps") as Step[];

  return (
    <MotionSection number="02" label={t("kicker")}>
      <SectionTitle>
        {t("titlePrefix")}{" "}
        <span className="bg-linear-to-r from-arena-primary to-arena-info bg-clip-text text-transparent">
          {t("titleHighlight")}
        </span>
        {t("titleSuffix")}
      </SectionTitle>
      <div className="relative mt-16 grid gap-10 md:grid-cols-3">
        <div className="absolute top-10 right-[16%] left-[16%] hidden h-px bg-linear-to-r from-transparent via-arena-primary/60 to-transparent md:block" />
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            {...fadeUp}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative"
          >
            <div
              className={cn(
                "mb-6 flex size-20 items-center justify-center rounded-full border font-sora text-2xl font-extrabold",
                index === 0
                  ? "border-arena-primary bg-arena-primary text-[#0B0F14] shadow-[0_0_34px_rgba(124,255,79,.4)]"
                  : "border-arena-border bg-arena-surface text-arena-text",
              )}
            >
              0{index + 1}
            </div>
            <h3 className="font-sora text-3xl font-extrabold text-arena-text">
              {step.title}
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-7 text-arena-text-sec">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </MotionSection>
  );
};

const FeaturesSection = () => {
  const t = useTranslations("homePage.mvp");
  const icons = [Users, CheckCircle2, Wallet, Receipt];
  const features = (t.raw("items") as Step[]).map((item, index) => ({
    ...item,
    icon: icons[index],
  })) as Feature[];

  return (
    <MotionSection number="03" label={t("kicker")}>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <SectionTitle>
          {t("title")}{" "}
          <span className="text-arena-primary">{t("titleAccent")}</span>
        </SectionTitle>
        <p className="max-w-lg self-end text-base leading-8 text-arena-text-sec md:text-lg">
          {t("body")}
        </p>
      </div>
      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <motion.article
            key={feature.title}
            {...fadeUp}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="group relative overflow-hidden rounded-[8px] border border-arena-border bg-linear-to-br from-arena-surface to-arena-bg-sec p-6"
          >
            <div className="absolute -top-10 -right-10 size-28 rounded-full bg-arena-primary/12 blur-2xl transition group-hover:bg-arena-primary/20" />
            <div className="relative mb-8 flex size-11 items-center justify-center rounded-[8px] bg-arena-primary text-[#0B0F14] shadow-[0_0_24px_rgba(124,255,79,.35)]">
              <feature.icon className="size-6" />
            </div>
            <div className="relative mb-5 flex items-center gap-3 text-xs font-extrabold text-arena-primary">
              {String(index + 1).padStart(2, "0")}/04
              <span className="h-px flex-1 bg-arena-primary/35" />
            </div>
            <h3 className="relative text-xl font-extrabold text-arena-text">
              {feature.title}
            </h3>
            <p className="relative mt-4 text-sm leading-7 text-arena-text-sec">
              {feature.description}
            </p>
          </motion.article>
        ))}
      </div>
    </MotionSection>
  );
};

const JourneySection = () => {
  const t = useTranslations("homePage.journey");
  const screens: PhoneScreen[] = ["journey", "create", "convoca", "paid"];
  const rotations = ["-6deg", "-2deg", "2deg", "6deg"];
  const steps = (t.raw("steps") as Omit<JourneyStep, "screen">[]).map(
    (item, index) => ({ ...item, screen: screens[index] }),
  ) as JourneyStep[];

  return (
    <MotionSection number="04" label={t("kicker")}>
      <div className="grid gap-8 lg:grid-cols-[1fr_.75fr]">
        <SectionTitle>{t("title")}</SectionTitle>
        <p className="max-w-lg self-end text-base leading-8 text-arena-text-sec md:text-lg">
          {t("body")}
        </p>
      </div>
      <div className="mt-16 grid gap-12 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            {...fadeUp}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="relative flex flex-col items-center"
          >
            {index < steps.length - 1 && (
              <ArrowRight className="absolute top-40 -right-8 hidden size-7 text-arena-primary/65 xl:block" />
            )}
            <div style={{ transform: `rotate(${rotations[index]})` }}>
              <PhoneMockup
                scale={0.62}
                screen={step.screen}
                className={
                  index === steps.length - 1
                    ? "drop-shadow-[0_0_24px_rgba(124,255,79,.55)]"
                    : undefined
                }
              />
            </div>
            <div className="mt-8 w-full text-center">
              <span className="rounded-full border border-arena-primary/25 bg-arena-primary/15 px-3 py-1 text-[10px] font-extrabold tracking-[0.16em] text-arena-primary uppercase">
                {step.label}
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-arena-text">
                {step.title}
              </h3>
              <p className="mx-auto mt-2 max-w-[230px] text-sm leading-6 text-arena-text-sec">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </MotionSection>
  );
};

const TestimonialsSection = () => {
  const t = useTranslations("homePage.testimonialsOusada");
  const testimonials = t.raw("items") as Testimonial[];
  const starKeys = ["one", "two", "three", "four", "five"];

  return (
    <MotionSection number="05" label={t("kicker")}>
      <SectionTitle>
        {t("titlePrefix")}{" "}
        <span className="bg-linear-to-r from-arena-primary to-arena-info bg-clip-text text-transparent">
          {t("titleHighlight")}
        </span>
      </SectionTitle>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {testimonials.map((testimonial, index) => (
          <motion.article
            key={testimonial.name}
            {...fadeUp}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="relative overflow-hidden rounded-[8px] border border-arena-border bg-linear-to-br from-arena-surface to-arena-bg-sec p-7"
          >
            <div className="absolute top-2 right-6 font-sora text-[80px] font-extrabold leading-none text-arena-primary/20">
              “
            </div>
            <div className="mb-6 flex gap-1 text-arena-primary">
              {starKeys.map(star => (
                <Star
                  key={star}
                  className="size-4"
                  fill="currentColor"
                  strokeWidth={0}
                />
              ))}
            </div>
            <p className="relative font-sora text-xl leading-8 font-bold text-arena-text">
              {testimonial.text}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-arena-primary font-extrabold text-[#0B0F14]">
                {testimonial.name.slice(0, 2)}
              </div>
              <div>
                <div className="font-bold text-arena-text">
                  {testimonial.name}
                </div>
                <div className="text-xs font-semibold text-arena-text-muted">
                  {testimonial.role}
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </MotionSection>
  );
};

const FinalCta = () => {
  const t = useTranslations("homePage.finalCta");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      router.push(`/waitlist?email=${encodeURIComponent(email)}`);
    } else {
      router.push("/waitlist");
    }
  };

  return (
    <section className="relative overflow-hidden border-t border-arena-border bg-[#06090D] px-5 py-24 md:px-10 lg:px-20 lg:py-35">
      <div className="absolute inset-0" style={meshStyle} />
      <div className="absolute inset-0 opacity-35" style={gridStyle} />
      <div className="relative mx-auto max-w-6xl text-center">
        <div className="inline-flex rounded-full border border-arena-primary/35 bg-arena-primary/10 px-4 py-2 text-[11px] font-extrabold tracking-[0.14em] text-arena-primary uppercase">
          {t("badge")}
        </div>
        <h2 className="mx-auto mt-8 max-w-5xl font-sora text-5xl leading-[0.95] font-extrabold tracking-normal text-arena-text md:text-8xl lg:text-[144px]">
          {t("headline")}{" "}
          <span className="bg-linear-to-r from-arena-primary to-arena-info bg-clip-text text-transparent">
            {t("headlineAccent")}
          </span>
        </h2>
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-12 flex max-w-2xl flex-col gap-3 rounded-[18px] border border-arena-primary/30 bg-arena-bg/55 p-3 shadow-[0_0_60px_rgba(124,255,79,.14)] backdrop-blur-xl sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            aria-label={t("emailLabel")}
            placeholder={t("emailPlaceholder")}
            className="min-h-13 flex-1 bg-transparent px-4 text-arena-text placeholder:text-arena-text-muted focus-visible:outline-none"
          />
          <Button
            type="submit"
            className="rounded-xl bg-arena-primary px-6 py-6 font-extrabold text-[#0B0F14] shadow-[0_0_28px_rgba(124,255,79,.45)] hover:bg-arena-primary/90"
          >
            {t("cta")}
          </Button>
        </form>
        <Link
          href="/auth"
          className="mt-7 inline-flex text-sm font-bold text-arena-text-sec transition-colors hover:text-arena-text"
        >
          {t("link")}
        </Link>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#06090D] text-arena-text">
      <HeroSection />
      <Marquee />
      <ProblemsSection />
      <HowSection />
      <FeaturesSection />
      <JourneySection />
      <TestimonialsSection />
      <FinalCta />
    </main>
  );
}
