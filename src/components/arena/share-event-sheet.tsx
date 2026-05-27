"use client";

import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Button } from "@/components/ui/button";

interface ShareEventSheetProps {
  event: {
    id: number;
    title: string;
    startDate: Date | string;
    location?: string | null;
  };
  onClose: () => void;
}

const WhatsAppIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    role="img"
    aria-label="WhatsApp icon"
  >
    <title>WhatsApp</title>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const STYLIZED_QR_GRID = [
  [1, 1, 1, 0, 0, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
  [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
  [0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
  [1, 0, 0, 1, 0, 1, 1, 0, 0, 1],
  [0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  [1, 1, 1, 0, 0, 1, 0, 0, 1, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 0, 1, 1, 0],
];

export function ShareEventSheet({ event, onClose }: ShareEventSheetProps) {
  const t = useTranslations("arenaEventDetail.shareSheet");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  // Generate clean public path matching the design: e.g. https://jogabola.pt/c/3-treino-tatico
  const eventSlug = event.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const publicUrl = `https://jogabola.pt/c/${event.id}-${eventSlug}`;

  const formattedDate = () => {
    try {
      const date = new Date(event.startDate);
      const datePart = date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${datePart} · ${hours}h${minutes}`;
    } catch {
      return "";
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      t("whatsappText", { title: event.title, url: publicUrl }),
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <BottomSheet title={t("title")} onClose={onClose} noPad>
      <div className="flex flex-col gap-4 px-5 py-4 pb-8 max-h-[82vh] overflow-y-auto">
        {/* 1. Event Briefing Header Card */}
        <div className="rounded-2xl border border-arena-border bg-arena-surface/40 p-4 flex flex-col min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-arena-text-muted">
            {t("event")}
          </span>
          <span className="font-extrabold text-arena-text text-base mt-1.5 leading-snug truncate">
            {event.title}
          </span>
          <span className="text-[11px] text-arena-text-sec mt-1 leading-none font-semibold">
            {formattedDate()}
          </span>
        </div>

        {/* 2. Custom Neon QR Code Card */}
        <div className="rounded-[24px] border border-arena-border bg-[#0B0F14]/50 p-6 max-w-[170px] w-full aspect-square flex flex-col items-center justify-center gap-3.5 mx-auto">
          <div className="w-24 h-24 grid grid-cols-10 gap-[2.5px] p-1.5 bg-[#0B0F14] rounded-lg">
            {STYLIZED_QR_GRID.map((row, rIdx) =>
              row.map((val, cIdx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static 10x10 grid is stable
                  key={`${rIdx}-${cIdx}`}
                  className={`aspect-square rounded-[1.5px] transition-all duration-300 ${
                    val === 1
                      ? "bg-arena-primary shadow-[0_0_4px_rgba(124,255,79,0.4)] animate-pulse"
                      : "bg-arena-surface-el/20"
                  }`}
                  style={{
                    animationDelay: `${(rIdx + cIdx) * 50}ms`,
                    animationDuration: "3s",
                  }}
                />
              )),
            )}
          </div>
          <span className="text-[9px] font-black text-arena-text-muted uppercase tracking-widest leading-none">
            {t("qrCode")}
          </span>
        </div>

        {/* 3. Link Display Input */}
        <div className="flex items-center gap-2.5 rounded-xl border border-arena-border bg-arena-surface px-3.5 h-11 min-w-0">
          <Link2 className="size-4 text-arena-text-muted shrink-0" />
          <span className="text-xs text-arena-text-sec truncate select-all flex-1 font-medium">
            {publicUrl}
          </span>
        </div>

        {/* 4. Instant Action Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="press flex h-11 items-center justify-center gap-2 rounded-xl border border-arena-border bg-arena-surface text-xs font-bold text-arena-text hover:bg-arena-surface-el transition-all"
          >
            {copied ? (
              <>
                <Check
                  className="size-4 text-arena-primary shrink-0"
                  strokeWidth={3}
                />
                <span>{t("copied")}</span>
              </>
            ) : (
              <>
                <Copy className="size-4 text-arena-text-sec shrink-0" />
                <span>{t("copyLink")}</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleWhatsAppShare}
            className="press flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0A2E1C]/80 border border-[#16A34A]/30 text-[#4ADE80] hover:bg-[#0A2E1C] text-xs font-bold transition-all"
          >
            <WhatsAppIcon className="size-4 text-[#4ADE80]" />
            <span>{t("whatsapp")}</span>
          </Button>
        </div>

        {/* 5. Public Roster Shortcut */}
        <div className="rounded-2xl border border-arena-border bg-arena-surface/40 p-3.5 flex items-center justify-between min-w-0 gap-3 mt-1">
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-arena-text leading-none">
              {t("presenceList")}
            </span>
            <span className="block text-[10px] text-arena-text-muted mt-1.5 leading-tight truncate">
              {t("presenceListSub")}
            </span>
          </div>

          <Button
            onClick={() => window.open(publicUrl, "_blank")}
            className="press h-8 px-3.5 font-bold text-[11px] rounded-lg gap-1.5 transition-all flex items-center bg-[#0A2E1C]/40 border border-[#16A34A]/30 text-[#4ADE80] hover:bg-[#0A2E1C]"
          >
            <ExternalLink className="size-3 text-[#4ADE80]" />
            <span>{t("open")}</span>
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
