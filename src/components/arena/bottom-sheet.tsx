"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getWrappedFocusTarget } from "./focus-trap";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

interface BottomSheetProps {
  onClose: () => void;
  title?: string;
  noPad?: boolean;
  hideClose?: boolean;
  children: React.ReactNode;
}

export function BottomSheet({
  onClose,
  title,
  noPad,
  hideClose,
  children,
}: BottomSheetProps) {
  const t = useTranslations("common");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    dialog.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      const openDialogs = document.querySelectorAll<HTMLElement>(
        '[role="dialog"][aria-modal="true"]',
      );
      if (openDialogs.item(openDialogs.length - 1) !== dialog) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(element => element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      const target = getWrappedFocusTarget(
        focusableElements,
        activeElement,
        event.shiftKey,
      );
      if (!target) return;

      event.preventDefault();
      target.focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, []);

  const sheet = (
    <div
      ref={dialogRef}
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[9999] flex flex-col justify-end bg-[#04070A]/75 backdrop-blur-sm animate-[fadeIn_.15s_ease] sm:justify-center sm:items-center sm:p-6"
      onKeyDown={event => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      tabIndex={-1}
    >
      <div className="mx-auto flex max-h-[88%] w-full max-w-[480px] flex-col rounded-t-[20px] bg-arena-bg-sec shadow-[0_-8px_40px_rgba(0,0,0,.5)] animate-[slideUp_.22s_cubic-bezier(.16,1,.3,1)_forwards] sm:mb-6 sm:rounded-[20px]">
        <div className="flex justify-center pt-2.5">
          <div className="h-1 w-9 rounded-full bg-arena-border" />
        </div>

        {title && (
          <div className="flex items-center justify-between border-arena-border border-b px-5 pt-3 pb-2.5">
            <span className="text-base font-bold text-arena-text">{title}</span>
            {!hideClose && (
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
            )}
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
