"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  MessageSquare,
  Send,
  Trash2,
  X,
} from "lucide-react";
import type { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EventChatMessage } from "@/hooks/use-event-chat";
import { cn } from "@/lib/utils";

interface EventChatTabProps {
  chatMessages: EventChatMessage[];
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onDeleteMessage: (id: number) => void;
  onCensorMessage: (id: number) => void;
  onRequestValidate?: () => void;
  canChat: boolean;
  isCaptain: boolean;
  sending: boolean;
  t: ReturnType<typeof useTranslations<"arenaEventDetail">>;
}

interface MessageMenuState {
  messageId: number;
  isSelf: boolean;
}

// Decorative placeholder bubbles for the blurred locked-chat teaser.
const TEASER_BUBBLES: { self: boolean; w: number }[] = [
  { self: false, w: 180 },
  { self: true, w: 120 },
  { self: false, w: 150 },
  { self: false, w: 200 },
  { self: true, w: 90 },
  { self: false, w: 160 },
];

export function EventChatTab({
  chatMessages,
  chatEndRef,
  inputMessage,
  onInputChange,
  onSend,
  onDeleteMessage,
  onCensorMessage,
  onRequestValidate,
  canChat,
  isCaptain,
  sending,
  t,
}: EventChatTabProps) {
  const [activeMenu, setActiveMenu] = useState<MessageMenuState | null>(null);

  const openMenu = useCallback(
    (msg: EventChatMessage) => {
      // Only open if this message can have actions
      if (msg.self || isCaptain) {
        setActiveMenu({ messageId: msg.id, isSelf: msg.self });
      }
    },
    [isCaptain],
  );

  const closeMenu = useCallback(() => setActiveMenu(null), []);

  const handleDelete = useCallback(() => {
    if (activeMenu) {
      onDeleteMessage(activeMenu.messageId);
      closeMenu();
    }
  }, [activeMenu, onDeleteMessage, closeMenu]);

  const handleCensor = useCallback(() => {
    if (activeMenu) {
      onCensorMessage(activeMenu.messageId);
      closeMenu();
    }
  }, [activeMenu, onCensorMessage, closeMenu]);

  if (!canChat) {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Blurred teaser bubbles — sense of activity, content unreadable */}
        <div
          aria-hidden="true"
          className="flex flex-1 flex-col gap-3.5 p-4 blur-[7px] select-none pointer-events-none opacity-60"
        >
          {TEASER_BUBBLES.map((b, i) => (
            <div
              key={`teaser-${i}`}
              className={cn(
                "flex items-start gap-2.5 max-w-[80%]",
                b.self ? "self-end flex-row-reverse" : "self-start",
              )}
            >
              {!b.self && (
                <div className="w-7 h-7 rounded-full shrink-0 bg-arena-surface-el" />
              )}
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2.5",
                  b.self ? "bg-arena-primary/40" : "bg-arena-surface",
                )}
                style={{ width: b.w }}
              >
                <div className="h-2.5 rounded bg-arena-text/20" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA overlay in front of blur */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-arena-bg/55 px-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-arena-primary/25 bg-arena-primary/10">
            <Lock className="w-5 h-5 text-arena-primary" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-arena-text">
            {t("interactive.chatLockedTitle")}
          </span>
          <span className="text-xs text-arena-text-muted max-w-[260px]">
            {t("interactive.chatLockedSub")}
          </span>
          {onRequestValidate && (
            <Button
              onClick={onRequestValidate}
              className="mt-1 h-10 rounded-xl bg-arena-primary px-5 text-[13px] font-bold text-arena-bg hover:bg-arena-primary/90"
            >
              {t("interactive.chatLockedCta")}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const activeMenuMsg = chatMessages.find(m => m.id === activeMenu?.messageId);
  const canCensorActive = isCaptain && activeMenu && !activeMenu.isSelf;
  const isActiveCensored = activeMenuMsg?.censored ?? false;

  return (
    <>
      {/* Context menu overlay */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closeMenu}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              aria-hidden="true"
            />
            <motion.div
              className="relative z-10 w-full max-w-sm mx-4 mb-8 bg-arena-surface border border-arena-border rounded-2xl overflow-hidden shadow-2xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Preview of message */}
              {activeMenuMsg && (
                <div className="px-4 pt-3 pb-2 border-b border-arena-border/40">
                  <p className="text-[11px] text-arena-text-muted line-clamp-2 italic">
                    {activeMenuMsg.censored
                      ? t("interactive.messageCensored")
                      : activeMenuMsg.text}
                  </p>
                </div>
              )}

              {activeMenu.isSelf && (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} className="shrink-0" />
                  {t("interactive.deleteMessage")}
                </button>
              )}

              {canCensorActive && (
                <button
                  onClick={handleCensor}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                  {isActiveCensored ? (
                    <>
                      <Eye size={16} className="shrink-0" />
                      {t("interactive.uncensorMessage")}
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} className="shrink-0" />
                      {t("interactive.censorMessage")}
                    </>
                  )}
                </button>
              )}

              <button
                onClick={closeMenu}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-arena-text-muted hover:bg-arena-surface-el transition-colors"
              >
                <X size={16} className="shrink-0" />
                {t("interactive.cancel")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat layout: scrollable messages + fixed input */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Scrollable message list */}
        <div className="flex-1 overflow-y-auto px-4 pt-3 flex flex-col gap-3.5 scrollbar-none pb-3">
          {chatMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <MessageSquare
                className="w-8 h-8 text-arena-text-muted mb-2"
                strokeWidth={1.5}
              />
              <span className="text-xs text-arena-text-muted">
                {t("interactive.chatEmpty")}
              </span>
            </div>
          ) : (
            chatMessages.map(msg => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  "flex items-start gap-2.5 max-w-[85%] select-none",
                  msg.self ? "self-end flex-row-reverse" : "self-start",
                  msg.self || isCaptain ? "cursor-pointer" : "",
                )}
                onClick={() => openMenu(msg)}
              >
                {!msg.self && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 border border-black/10 text-arena-bg shadow-sm"
                    style={{ backgroundColor: msg.color }}
                  >
                    {msg.initials}
                  </div>
                )}

                <div className="flex flex-col">
                  {!msg.self && (
                    <span className="text-[10px] font-bold text-arena-text-muted ml-1.5 mb-0.5">
                      {msg.name}
                    </span>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm relative",
                      msg.self
                        ? "bg-arena-primary text-[#0B0F14] font-semibold rounded-tr-none"
                        : "bg-arena-surface border border-arena-border text-arena-text rounded-tl-none",
                      msg.censored && !msg.self && "overflow-hidden",
                    )}
                  >
                    {msg.censored && !msg.self ? (
                      <>
                        {/* Blurred text */}
                        <span
                          className="block select-none"
                          style={{ filter: "blur(6px)", userSelect: "none" }}
                          aria-hidden="true"
                        >
                          {msg.text}
                        </span>
                        {/* Censurado label overlay */}
                        <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                          <EyeOff
                            size={11}
                            className="text-arena-text-muted shrink-0"
                          />
                          <span className="text-[10px] font-bold text-arena-text-muted">
                            {t("interactive.messageCensored")}
                          </span>
                        </div>
                      </>
                    ) : (
                      msg.text
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[8px] text-arena-text-muted mt-0.5 px-1.5",
                      msg.self ? "text-right" : "text-left",
                    )}
                  >
                    {msg.time}
                  </span>
                </div>
              </motion.div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Fixed input bar at bottom */}
        <div className="shrink-0 px-4 pb-4 pt-2 border-t border-arena-border/30 flex items-center gap-2 bg-arena-bg">
          <Input
            placeholder={t("interactive.chatPlaceholder")}
            value={inputMessage}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            className="flex-1 bg-arena-surface-el border-arena-border text-arena-text h-10 rounded-xl px-3.5 text-xs"
          />
          <Button
            onClick={onSend}
            disabled={sending || !inputMessage.trim()}
            className="w-10 h-10 bg-arena-primary hover:bg-arena-primary/90 text-[#0B0F14] flex items-center justify-center shrink-0 rounded-xl disabled:opacity-50 transition-all active:scale-95"
          >
            <Send className="w-4.5 h-4.5" />
          </Button>
        </div>
      </div>
    </>
  );
}
