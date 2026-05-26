"use client";

import { MessageSquare, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { EventChatMessage } from "../_fixtures/event-detail-mock";

interface EventChatTabProps {
  chatMessages: EventChatMessage[];
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  t: ReturnType<typeof useTranslations<"arenaEventDetail">>;
}

export function EventChatTab({
  chatMessages,
  chatEndRef,
  inputMessage,
  onInputChange,
  onSend,
  t,
}: EventChatTabProps) {
  return (
    <div className="flex flex-col h-[60vh] border border-arena-border bg-arena-surface/40 rounded-2xl overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-[fadeIn_.2s_ease-out]">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 scrollbar-none">
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
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-2.5 max-w-[85%]",
                msg.self ? "self-end flex-row-reverse" : "self-start",
              )}
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
                    "rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm",
                    msg.self
                      ? "bg-arena-primary text-[#0B0F14] font-semibold rounded-tr-none"
                      : "bg-arena-surface border border-arena-border text-arena-text rounded-tl-none",
                  )}
                >
                  {msg.text}
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
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 border-t border-arena-border bg-arena-surface flex items-center gap-2">
        <Input
          placeholder={t("interactive.chatPlaceholder")}
          value={inputMessage}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") onSend();
          }}
          className="flex-1 bg-arena-surface-el border-arena-border text-arena-text h-10 rounded-xl px-3.5 text-xs"
        />
        <Button
          onClick={onSend}
          className="w-10 h-10 bg-arena-primary hover:bg-arena-primary/90 text-[#0B0F14] flex items-center justify-center shrink-0 rounded-xl"
        >
          <Send className="w-4.5 h-4.5" />
        </Button>
      </div>
    </div>
  );
}
