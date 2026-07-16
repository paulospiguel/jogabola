"use client";

import { useStatsigClient } from "@statsig/react-bindings";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import { joinWaitlist } from "@/actions/waitlist.actions";
import { Logo } from "@/components/logo";
import { signOut, useSession } from "@/lib/auth-client";
import { useAnalyticsConsent } from "@/providers/analytics";

function WaitlistContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const analyticsAllowed = useAnalyticsConsent();
  const { logEvent } = useStatsigClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const t = useTranslations("common");
  const tWaitlist = useTranslations("waitlist");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await joinWaitlist({ name, email });

    if (result.success) {
      if (analyticsAllowed) {
        logEvent("waitlist_joined");
      }
      setDone(true);
    } else {
      const err = result.error;
      if (typeof err === "string") {
        setError(err);
      } else {
        const msgs = Object.values(err ?? {}).flat();
        setError(msgs[0] ?? tWaitlist("error"));
      }
    }

    setLoading(false);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A16]">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[15%] left-[8%] h-80 w-80 rounded-full bg-[#5D17A9]/22 blur-[90px]" />
        <div className="absolute right-[5%] bottom-[10%] h-96 w-96 rounded-full bg-[#0B3B78]/18 blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7CFF4F]/5 blur-[80px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-10">
          <Logo variant="white" size="small" href="/" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Beta badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#7CFF4F]/20 bg-[#7CFF4F]/8 px-3 py-1 text-xs font-semibold tracking-widest text-[#7CFF4F] uppercase">
              <span className="size-1.5 rounded-full bg-[#7CFF4F] animate-pulse" />
              {t("comingSoon")}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
              >
                <CheckCircle className="mx-auto mb-4 size-12 text-[#7CFF4F]" />
                <h2 className="mb-2 text-xl font-bold text-white">
                  {tWaitlist("successTitle")}
                </h2>
                <p className="text-sm text-white/50">
                  {tWaitlist("successDescription")}
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
                >
                  {tWaitlist("backToHome")}
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-8"
              >
                <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
                  {tWaitlist("arena")}
                </h1>
                <p className="mb-6 text-sm leading-relaxed text-white/45">
                  {tWaitlist("description")}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder={tWaitlist("namePlaceholder")}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      minLength={2}
                      className="h-11 w-full rounded-xl border border-white/15 bg-white/8 px-4 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-white/35 focus:bg-white/12"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder={tWaitlist("emailPlaceholder")}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="h-11 w-full rounded-xl border border-white/15 bg-white/8 px-4 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-white/35 focus:bg-white/12"
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-400"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7CFF4F] text-sm font-semibold text-black transition-all hover:bg-[#7CFF4F]/90 disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        {tWaitlist("submitBtn")}
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-4 text-center text-xs text-white/25">
                  {session ? (
                    <>
                      {tWaitlist.rich("sessionActive", {
                        email: _chunks => (
                          <span className="text-white/45 font-semibold">
                            {session.user.email}
                          </span>
                        ),
                      })}{" "}
                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="text-[#7CFF4F] hover:text-[#7CFF4F]/80 underline underline-offset-2 transition-colors cursor-pointer font-semibold"
                      >
                        {tWaitlist("logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      {tWaitlist("alreadyHaveAccess")}{" "}
                      <Link
                        href="/auth"
                        className="text-white/40 underline underline-offset-2 hover:text-white/70 transition-colors"
                      >
                        {tWaitlist("signIn")}
                      </Link>
                    </>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A16]" />}>
      <WaitlistContent />
    </Suspense>
  );
}
