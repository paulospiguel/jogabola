"use client";

import { motion } from "framer-motion";
import { RefreshCw, Tv2Icon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const TacticalDiagram = ({ t }: { t: (key: string) => string }) => (
  <div className="relative h-full w-full">
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <title>Tactical Diagram</title>
      <circle
        cx="200"
        cy="150"
        r="60"
        stroke="white"
        strokeOpacity="0.05"
        strokeWidth="2"
      />

      <motion.path
        d="M 50 200 Q 150 180 220 120 T 350 100"
        stroke="#2563eb"
        strokeWidth="3"
        strokeDasharray="8 8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      <motion.circle
        cx="50"
        cy="200"
        r="6"
        fill="#0f172a"
        stroke="#2563eb"
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      />
      <text
        x="40"
        y="230"
        className="fill-blue-500 text-[10px] font-black tracking-widest uppercase"
      >
        {t("startRoute")}
      </text>

      <motion.circle
        cx="220"
        cy="120"
        r="6"
        fill="#0f172a"
        stroke="#2563eb"
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      />

      <motion.circle
        cx="300"
        cy="150"
        r="6"
        fill="#0f172a"
        stroke="#2563eb"
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5 }}
      />

      <g className="translate-x-[350px] translate-y-[100px]">
        <motion.circle
          r="40"
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 2 }}
        />
        <motion.path
          d="M -20 -20 L 20 20 M -20 20 L 20 -20"
          stroke="#ef4444"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 2.2 }}
        />
        <text
          x="0"
          y="-50"
          textAnchor="middle"
          className="fill-red-500 text-[10px] font-black tracking-widest uppercase"
        >
          {t("offside404")}
        </text>
      </g>
    </svg>
  </div>
);

const GridBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-slate-950" />
    <div
      className="absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage: `linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />
    <div className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-blue-600/5 blur-[120px]" />
  </div>
);

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4">
      <GridBackground />

      <div className="relative z-10 w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="overflow-hidden rounded-[40px] border border-white/10 bg-slate-900/60 p-4 backdrop-blur-3xl md:p-8 lg:p-12"
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8 flex justify-center md:absolute md:top-12 md:right-12 md:z-20"
            >
              <Logo size="small" variant="white" />
            </motion.div>

            <div className="flex flex-col justify-center text-left">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 inline-flex"
              >
                <div className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1">
                  <span className="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase">
                    {t("warning")}
                  </span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-4 text-5xl font-black tracking-tighter text-white md:text-7xl lg:text-8xl"
              >
                404 -{" "}
                <span className="text-neon-primary italic">
                  {t("title").split("- ")[1]}
                </span>
              </motion.h1>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 text-xl font-bold tracking-tight text-white md:text-3xl"
              >
                {t("subtitle")}
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-12 max-w-lg text-lg leading-relaxed text-gray-400"
              >
                {t("description")}
              </motion.p>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 flex items-center justify-center">
                <TacticalDiagram t={t} />
              </div>
            </div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Button
              onClick={() => window.location.reload()}
              className="group h-16 rounded-2xl bg-neon-primary px-8 text-sm font-black tracking-widest text-white uppercase transition-all hover:bg-neon-primary/80 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
            >
              <RefreshCw
                className="mr-3 transition-transform group-hover:rotate-180"
                size={18}
              />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] text-zinc-800 opacity-70">
                  {t("labelRefresh")}
                </span>
                <span className="text-zinc-800">
                  {t("refreshButton").includes("(")
                    ? t("refreshButton").split("(")[1].replace(")", "").trim()
                    : t("refreshButton")}
                </span>
              </div>
            </Button>

            <Button
              variant="secondary"
              asChild
              className="h-16 rounded-2xl border border-white/5 bg-white/5 px-8 text-sm font-black tracking-widest text-white uppercase transition-all hover:bg-white/10"
            >
              <Link href="/">
                <Tv2Icon />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] opacity-70">
                    {t("labelVAR")}
                  </span>
                  <span>
                    {t("callVARButton").includes("(")
                      ? t("callVARButton").split("(")[1].replace(")", "").trim()
                      : t("callVARButton")}
                  </span>
                </div>
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
