"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { passkey } from "@/lib/auth-client";

interface PasskeyPromptGateProps {
  hasPasskey: boolean;
  userId: string;
  translations: {
    title: string;
    description: string;
    yes: string;
    no: string;
    skip: string;
    success: string;
    error: string;
  };
}

export function PasskeyPromptGate({
  hasPasskey,
  userId,
  translations,
}: PasskeyPromptGateProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "adding" | "success" | "error">(
    "idle",
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || hasPasskey) return;

    const refused = localStorage.getItem(
      `jogabola-passkey-prompt-refused-${userId}`,
    );
    const skipped = sessionStorage.getItem(
      `jogabola-passkey-prompt-skipped-${userId}`,
    );

    if (!refused && !skipped) {
      // Pequeno delay para uma experiência de transição suave ao carregar a página
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [mounted, hasPasskey, userId]);

  if (!mounted) return null;

  async function handleRegister() {
    setStatus("adding");
    try {
      const result = await passkey.addPasskey();
      if (result?.error) throw new Error(result.error.message);
      setStatus("success");
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } catch {
      setStatus("error");
    }
  }

  function handleRefuse() {
    localStorage.setItem(`jogabola-passkey-prompt-refused-${userId}`, "true");
    setIsOpen(false);
  }

  function handleSkip() {
    sessionStorage.setItem(`jogabola-passkey-prompt-skipped-${userId}`, "true");
    setIsOpen(false);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleSkip();
      }}
    >
      <DialogContent className="border-arena-border bg-[#0B0F14]/95 max-w-md p-6 text-center sm:rounded-2xl shadow-[0_0_32px_rgba(124,255,79,0.15)]">
        <DialogHeader className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7CFF4F]/10 text-[#7CFF4F] mb-4 animate-pulse">
            <Fingerprint className="h-8 w-8" />
          </div>
          <DialogTitle className="text-xl font-bold text-arena-text text-center font-sora">
            {translations.title}
          </DialogTitle>
          <DialogDescription className="text-arena-text-sec text-sm mt-2 max-w-sm text-center">
            {translations.description}
          </DialogDescription>
        </DialogHeader>

        {status === "success" && (
          <div className="flex items-center gap-2 justify-center rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-300 my-2">
            <CheckCircle2 size={16} />
            {translations.success}
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 justify-center rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 my-2">
            <AlertTriangle size={16} />
            {translations.error}
          </div>
        )}

        <DialogFooter className="flex flex-col gap-2 mt-4 sm:flex-col sm:space-x-0 w-full">
          <Button
            className="w-full bg-[#7CFF4F] font-bold text-[#0B0F14] hover:bg-[#7CFF4F]/90 btn-press press"
            disabled={status === "adding" || status === "success"}
            onClick={handleRegister}
          >
            {status === "adding" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {translations.yes}
              </>
            ) : (
              translations.yes
            )}
          </Button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              className="w-full bg-[#151C26] border border-[#263244] text-arena-text-sec hover:bg-[#1B2430] btn-press press"
              disabled={status === "adding" || status === "success"}
              onClick={handleSkip}
              variant="outline"
            >
              {translations.skip}
            </Button>
            <Button
              className="w-full bg-transparent text-arena-text-muted hover:text-red-400 hover:bg-red-500/5 btn-press press"
              disabled={status === "adding" || status === "success"}
              onClick={handleRefuse}
              variant="ghost"
            >
              {translations.no}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
