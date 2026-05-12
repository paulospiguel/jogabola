"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Megaphone, Trash2, Send, AlertTriangle, MapPin, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pt, enUS, es, fr } from "date-fns/locale";
import { getEventNotices, createEventNotice, deleteEventNotice } from "@/actions/notices.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

interface Notice {
  id: number;
  message: string;
  type: string;
  createdAt: Date | null;
  author: {
    name: string | null;
    image: string | null;
  } | null;
}

interface EventNoticeWallProps {
  eventId: number;
  isManager?: boolean;
}

const LOCALE_MAP = {
  pt: pt,
  en: enUS,
  es: es,
  fr: fr,
};

export function EventNoticeWall({ eventId, isManager }: EventNoticeWallProps) {
  const t = useTranslations("arenaEventDetail.noticeWall");
  const locale = useLocale() as keyof typeof LOCALE_MAP;
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    loadNotices();
  }, [eventId]);

  async function loadNotices() {
    setLoading(true);
    const res = await getEventNotices(eventId);
    if (res.success) {
      setNotices(res.data as unknown as Notice[]);
    }
    setLoading(false);
  }

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    const res = await createEventNotice({
      matchSessionId: eventId,
      message: message.trim(),
      type: "info"
    });
    if (res.success) {
      setMessage("");
      setShowInput(false);
      loadNotices();
    }
    setSending(false);
  }

  async function handleDelete(id: number) {
    if (!confirm(`${t("delete")}?`)) return;
    const res = await deleteEventNotice(id);
    if (res.success) {
      loadNotices();
    }
  }

  if (loading && notices.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone size={18} className="text-arena-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-arena-text">
            {t("title")}
          </h3>
        </div>
        {isManager && !showInput && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInput(true)}
            className="h-8 text-xs font-bold text-arena-primary hover:bg-arena-primary/10"
          >
            + {t("send")}
          </Button>
        )}
      </div>

      {showInput && (
        <div className="flex flex-col gap-2 rounded-xl border border-arena-primary/30 bg-arena-primary/5 p-3 animate-in fade-in slide-in-from-top-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("placeholder")}
            className="min-h-[80px] bg-arena-bg border-arena-border text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInput(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={sending || !message.trim()}
              onClick={handleSend}
              className="bg-arena-primary text-arena-bg font-bold text-xs"
            >
              {sending ? "..." : t("send")}
              <Send size={14} className="ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {notices.length === 0 && !showInput && (
          <p className="text-center py-4 text-xs text-arena-text-muted border border-dashed border-arena-border rounded-xl">
            {t("empty")}
          </p>
        )}
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={cn(
              "group relative flex flex-col gap-2 rounded-xl border-l-4 p-4 transition-all",
              "bg-arena-surface border-arena-border",
              notice.type === "urgent" && "border-l-arena-danger bg-arena-danger/5",
              notice.type === "field_change" && "border-l-arena-warning bg-arena-warning/5",
              notice.type === "info" && "border-l-arena-info bg-arena-info/5"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-[13px] leading-relaxed text-arena-text whitespace-pre-wrap">
                  {notice.message}
                </p>
              </div>
              {isManager && (
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-arena-text-muted hover:text-arena-danger"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <JbAvatar
                  id={notice.author?.name || "A"}
                  name={notice.author?.name || "Autor"}
                  image={notice.author?.image}
                  className="size-5"
                />
                <span className="text-[11px] font-medium text-arena-text-sec">
                  {notice.author?.name}
                </span>
              </div>
              {notice.createdAt && (
                <span className="text-[10px] text-arena-text-muted">
                  {formatDistanceToNow(new Date(notice.createdAt), {
                    addSuffix: true,
                    locale: LOCALE_MAP[locale] || pt,
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
