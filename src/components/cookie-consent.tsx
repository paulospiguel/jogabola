"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  if (!mounted) return null;

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4"
        >
          <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="space-y-2">
                <h3 className="text-sm font-bold tracking-wider text-white uppercase">
                  Controle de Cookies
                </h3>
                <p className="max-w-md text-sm text-gray-400">
                  Utilizamos cookies para melhorar sua experiência em nosso
                  site. Ao navegar você concorda com nossa{" "}
                  <a href="/privacy" className="text-blue-400 hover:underline">
                    Política de Privacidade
                  </a>
                  .
                </p>
              </div>
              <div className="flex w-full shrink-0 items-center justify-end gap-3 md:w-auto">
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  className="rounded-lg border-white/10 bg-white/5 px-6 font-bold text-white transition-all hover:bg-white/10"
                >
                  Recusar
                </Button>
                <Button
                  onClick={handleAccept}
                  className="rounded-lg bg-blue-600 px-8 font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
                >
                  Aceitar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
