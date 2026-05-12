"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JbBottomSheetProps {
  onClose: () => void;
  title?: string;
  noPad?: boolean;
  children: React.ReactNode;
}

export function JbBottomSheet({
  onClose,
  title,
  noPad,
  children,
}: JbBottomSheetProps) {
  const t = useTranslations("common");
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalRef.current = document.body;
  }, []);

  const sheet = (
    <div
      aria-modal="true"
      onKeyDown={e => {
        if (e.key === "Escape") onClose();
      }}
      role="dialog"
      className="fixed inset-0 z-[9999] flex flex-col justify-end bg-[#04070A]/75 backdrop-blur-sm animate-[fadeIn_.15s_ease]"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      tabIndex={-1}
    >
      <div className="flex max-h-[88%] flex-col rounded-t-[20px] bg-arena-bg-sec shadow-[0_-8px_40px_rgba(0,0,0,.5)] animate-[slideUp_.22s_cubic-bezier(.16,1,.3,1)_forwards]">
        <div className="flex justify-center pt-2.5">
          <div className="h-1 w-9 rounded-full bg-arena-border" />
        </div>

        {title && (
          <div className="flex items-center justify-between border-arena-border border-b px-5 pt-3 pb-2.5">
            <span className="text-base font-bold text-arena-text">{title}</span>
            <Button
              className="size-[30px] min-h-0 min-w-0 rounded-[9px] border border-arena-border bg-arena-surface text-arena-text-sec hover:bg-arena-surface-el"
              onClick={onClose}
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("close")}
            >
              <X size={14} strokeWidth={2} />
            </Button>
          </div>
        )}

        <div
          className={cn(
            "flex flex-col flex-1 overflow-hidden",
            !noPad && "px-5 py-4",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );

  // Render via portal at document.body to escape any parent stacking contexts
  // (e.g. SidebarProvider, jb-arena-shell with z-index, etc.)
  if (typeof window === "undefined") return null;
  return createPortal(sheet, document.body);
}
