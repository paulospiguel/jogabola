"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Receipt,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ComponentType, useRef, useState } from "react";
import pitchNightImage from "@/assets/og/pitch-night.jpg";
import { DemoModal } from "@/components/demo/demo-modal";
import {
  PhoneMockup,
  type PhoneScreen,
} from "@/components/landing/phone-mockup";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/providers/analytics";

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
  const { logEvent } = useAnalytics();

  const ctaHref = session?.user ? "/arena" : "/auth";
  const ctaLabel = session?.user ? t("goToArena") : headerT("launchJourney");

  return (
    <section className="relative overflow-hidden bg-[#06090D] px-5 pt-28 pb-14 md:px-10 lg:min-h-[680px] lg:px-20 lg:pt-20 lg:pb-8">
      <Image
        src={pitchNightImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[65%_30%] lg:object-[75%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#06090D] via-[#06090D]/68 to-[#06090D]" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-[#06090D] via-[#06090D]/55 to-transparent lg:block" />
      <div className="absolute inset-0 opacity-25" style={gridStyle} />
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

        <div className="mt-8 grid items-center gap-12 lg:mt-6 lg:grid-cols-[1.45fr_1fr]">
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75 }}
          >
            <h1 className="font-sora text-[60px] leading-[0.9] font-extrabold tracking-normal text-arena-text md:text-[96px] lg:text-[120px]">
              <span>{t("headline.play")} </span>
              <span className="italic" style={textStroke()}>
                {t("headline.more")}
              </span>
              <br />
              <span className="text-arena-primary">
                {t("headline.organize")}
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-arena-text-sec md:text-xl">
              {t("description")}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                className="press rounded-full bg-arena-primary px-6 py-6 text-sm font-extrabold text-[#0B0F14] shadow-[0_0_32px_rgba(124,255,79,.45)] hover:bg-arena-primary/90"
              >
                <Link
                  href={ctaHref}
                  onClick={() =>
                    logEvent("landing_cta_clicked", undefined, {
                      destination: session?.user ? "arena" : "auth",
                      location: "hero",
                    })
                  }
                >
                  {ctaLabel}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <DemoModal
                label={t("secondaryCta")}
                className="press inline-flex items-center rounded-full border border-arena-border bg-arena-bg/60 px-6 py-3.5 text-sm font-bold text-arena-text backdrop-blur-xl hover:bg-arena-surface transition-colors"
              />
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-4 flex justify-center lg:mt-0 lg:rotate-[-4deg]"
          >
            <div className="absolute top-10 left-1/2 size-[300px] -translate-x-1/2 rounded-full bg-arena-primary/25 blur-[36px] lg:top-16 lg:size-[420px]" />
            <PhoneMockup
              scale={0.62}
              screen="team"
              className="relative z-10 lg:hidden"
            />
            <PhoneMockup
              scale={0.82}
              screen="team"
              className="relative z-10 hidden lg:block"
            />
            <div className="absolute top-8 left-2 z-20 rotate-[-6deg] rounded-[14px] border border-arena-primary/35 bg-arena-bg/80 px-3 py-2.5 shadow-2xl backdrop-blur-xl sm:left-[16%] lg:top-20 lg:-left-8 lg:px-4 lg:py-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-arena-text lg:text-sm">
                <CheckCircle2 className="size-4 text-arena-primary" />
                {t("badgeConfirmed")}
              </div>
            </div>
            <div className="absolute right-2 bottom-14 z-20 rotate-[4deg] rounded-[14px] border border-arena-border bg-arena-bg/85 px-4 py-3 shadow-2xl backdrop-blur-xl sm:right-[16%] lg:right-0 lg:bottom-24 lg:px-5 lg:py-4">
              <div className="font-sora text-2xl font-extrabold text-arena-primary lg:text-3xl">
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
        <span className="text-arena-primary">{t("titleHighlight")}</span>
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
      <div className="mt-14 border-y border-arena-border">
        {features.map((feature, index) => (
          <motion.article
            key={feature.title}
            {...fadeUp}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-2 border-b border-arena-border px-1 py-7 transition-colors last:border-b-0 hover:bg-arena-surface/60 md:grid-cols-[110px_1fr_1.1fr] md:items-center md:gap-x-10 md:py-9"
          >
            <span
              aria-hidden="true"
              className="font-sora text-3xl leading-none font-extrabold text-transparent md:text-5xl"
              style={{ WebkitTextStroke: "1.5px rgba(124,255,79,.5)" }}
            >
              0{index + 1}
            </span>
            <div className="flex items-center gap-3">
              <feature.icon className="size-5 shrink-0 text-arena-primary" />
              <h3 className="font-sora text-xl font-extrabold text-arena-text md:text-2xl">
                {feature.title}
              </h3>
            </div>
            <p className="col-span-2 text-sm leading-7 text-arena-text-sec md:col-span-1 md:col-start-3">
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
  const commonT = useTranslations("common");
  const screens: PhoneScreen[] = ["journey", "create", "convoca", "paid"];
  const rotations = ["-6deg", "-2deg", "2deg", "6deg"];
  const steps = (t.raw("steps") as Omit<JourneyStep, "screen">[]).map(
    (item, index) => ({ ...item, screen: screens[index] }),
  ) as JourneyStep[];

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.scrollWidth / steps.length;
    const index = Math.round(track.scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), steps.length - 1));
  };

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.scrollWidth / steps.length;
    track.scrollTo({ left: cardWidth * index, behavior: "smooth" });
  };

  const zoomedStep = zoomIndex !== null ? steps[zoomIndex] : null;

  return (
    <MotionSection number="04" label={t("kicker")}>
      <div className="grid gap-8 lg:grid-cols-[1fr_.75fr]">
        <SectionTitle>{t("title")}</SectionTitle>
        <p className="max-w-lg self-end text-base leading-8 text-arena-text-sec md:text-lg">
          {t("body")}
        </p>
      </div>
      <div
        ref={trackRef}
        onScroll={handleTrackScroll}
        className="-mx-5 mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-12 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4"
      >
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            {...fadeUp}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="relative flex w-[64vw] max-w-[250px] shrink-0 snap-center flex-col items-center md:w-auto md:max-w-none md:shrink"
          >
            {index < steps.length - 1 && (
              <ArrowRight className="absolute top-40 -right-8 hidden size-7 text-arena-primary/65 xl:block" />
            )}
            {/* biome-ignore lint/a11y/useSemanticElements: can't be a <button> — PhoneMockup renders its own internal <button>, and buttons can't nest */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setZoomIndex(index)}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setZoomIndex(index);
                }
              }}
              aria-label={commonT("zoomImage", { label: step.title })}
              className="press cursor-zoom-in rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-arena-primary/60"
              style={{ transform: `rotate(${rotations[index]})` }}
            >
              <div inert>
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

      <div className="mt-6 flex items-center justify-center gap-2 md:hidden">
        {steps.map((step, index) => (
          <button
            key={step.label}
            type="button"
            onClick={() => scrollToIndex(index)}
            aria-label={commonT("goToStep", { number: index + 1 })}
            className={cn(
              "press h-2 rounded-full transition-all duration-300",
              index === activeIndex
                ? "w-6 bg-arena-primary"
                : "w-2 bg-arena-border",
            )}
          />
        ))}
      </div>

      <Dialog
        open={zoomIndex !== null}
        onOpenChange={open => !open && setZoomIndex(null)}
      >
        <DialogContent className="flex max-h-[85vh] max-w-sm flex-col items-center overflow-y-auto border-arena-border bg-[#06090D]/98 p-6 sm:rounded-[28px]">
          {zoomedStep && (
            <>
              <DialogTitle className="sr-only">{zoomedStep.title}</DialogTitle>
              <DialogDescription className="sr-only">
                {zoomedStep.description}
              </DialogDescription>
              <span className="rounded-full border border-arena-primary/25 bg-arena-primary/15 px-3 py-1 text-[10px] font-extrabold tracking-[0.16em] text-arena-primary uppercase">
                {zoomedStep.label}
              </span>
              <PhoneMockup
                scale={0.68}
                screen={zoomedStep.screen}
                className="mt-6"
              />
              <h3 className="mt-6 text-xl font-extrabold text-arena-text">
                {zoomedStep.title}
              </h3>
              <p className="mt-2 max-w-[280px] text-center text-sm leading-6 text-arena-text-sec">
                {zoomedStep.description}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setZoomIndex(
                      prev => ((prev ?? 0) - 1 + steps.length) % steps.length,
                    )
                  }
                  aria-label={commonT("previousSlide")}
                  className="press flex size-11 items-center justify-center rounded-full border border-arena-border bg-arena-surface text-arena-text hover:border-arena-primary/40"
                >
                  <ArrowRight className="size-4 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setZoomIndex(prev => ((prev ?? 0) + 1) % steps.length)
                  }
                  aria-label={commonT("nextSlide")}
                  className="press flex size-11 items-center justify-center rounded-full border border-arena-border bg-arena-surface text-arena-text hover:border-arena-primary/40"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MotionSection>
  );
};

const FinalCta = () => {
  const t = useTranslations("homePage.finalCta");
  const [email, setEmail] = useState("");
  const router = useRouter();
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
    <section className="relative overflow-hidden border-t border-arena-border bg-[#06090D] px-5 py-24 md:px-10 lg:px-20 lg:py-35">
      <div className="absolute inset-0" style={meshStyle} />
      <div className="absolute inset-0 opacity-35" style={gridStyle} />
      <div className="relative mx-auto max-w-6xl text-center">
        <div className="inline-flex rounded-full border border-arena-primary/35 bg-arena-primary/10 px-4 py-2 text-[11px] font-extrabold tracking-[0.14em] text-arena-primary uppercase">
          {t("badge")}
        </div>
        <h2 className="mx-auto mt-8 max-w-5xl font-sora text-5xl leading-[0.95] font-extrabold tracking-normal text-arena-text md:text-8xl lg:text-[144px]">
          {t("headline")}{" "}
          <span className="text-arena-primary">{t("headlineAccent")}</span>
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
            className="press rounded-xl bg-arena-primary px-6 py-6 font-extrabold text-[#0B0F14] shadow-[0_0_28px_rgba(124,255,79,.45)] hover:bg-arena-primary/90"
          >
            {t("cta")}
          </Button>
        </form>
        <Link
          href="/auth"
          onClick={() =>
            logEvent("landing_cta_clicked", undefined, {
              destination: "auth",
              location: "final_link",
            })
          }
          className="press mt-7 inline-flex text-sm font-bold text-arena-text-sec transition-colors hover:text-arena-text"
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
      <FinalCta />
    </main>
  );
}
