"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Pencil,
  Send,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Marker, Map as PigeonMap } from "pigeon-maps";
import { useEffect, useRef, useState } from "react";
import { updateEvent } from "@/actions/match-sessions.actions";

interface LocationMapProps {
  location: string;
  eventId?: number;
  canEdit?: boolean;
}

type Coords = [number, number];

async function geocode(address: string): Promise<Coords | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "pt", "User-Agent": "Jogabola/1.0" },
    });
    const data = await res.json();
    if (data?.[0]) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch {
    return null;
  }
}

export function LocationMap({
  location: initialLocation,
  eventId,
  canEdit,
}: LocationMapProps) {
  const t = useTranslations("arenaEventDetail");
  const [location, setLocation] = useState(initialLocation);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(location);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    geocode(location).then(c => {
      setCoords(c);
      setLoading(false);
    });
  }, [location]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (editing) {
      setDraft(location);
      timeoutId = setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [editing, location]);

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === location) {
      setEditing(false);
      return;
    }
    if (!eventId) return;
    setSaving(true);
    setEditError(null);
    const res = await updateEvent(eventId, { location: trimmed });
    setSaving(false);
    if (res.success) {
      setLocation(trimmed);
      setEditing(false);
    } else {
      setEditError(t("locationMap.errorSaving"));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditing(false);
  }

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(location)}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(location)}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`📍 ${location}\n${mapsUrl}`)}`;
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(mapsUrl)}&text=${encodeURIComponent(`📍 ${location}`)}`;

  function copyAddress() {
    navigator.clipboard.writeText(location).then(() => {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(mapsUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* Map */}
      <div className="overflow-hidden rounded-[16px] border border-arena-border bg-arena-surface">
        <div className="relative h-52 w-full overflow-hidden">
          {loading ? (
            <div className="flex h-full items-center justify-center bg-arena-bg-sec">
              <MapPin size={28} className="animate-pulse text-arena-primary" />
            </div>
          ) : coords ? (
            <PigeonMap
              center={coords}
              zoom={15}
              height={208}
              attribution={false}
            >
              <Marker anchor={coords} payload={location}>
                <div className="flex flex-col items-center">
                  <div className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-arena-primary shadow-lg">
                    <MapPin
                      size={16}
                      className="text-arena-bg"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="-mt-1 h-2 w-0.5 bg-arena-primary" />
                </div>
              </Marker>
            </PigeonMap>
          ) : (
            <div className="flex h-full items-center justify-center bg-arena-bg-sec">
              <div className="text-center">
                <MapPin
                  size={28}
                  className="mx-auto mb-2 text-arena-text-muted"
                  strokeWidth={1.5}
                />
                <p className="text-[12px] text-arena-text-muted">
                  {t("locationMap.notFound")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Address + open in maps */}
        <div className="px-3.5 py-3">
          {editing ? (
            <div className="mb-2.5">
              <div className="flex items-center gap-1.5 rounded-[10px] border border-arena-primary/50 bg-arena-bg px-3 py-2">
                <MapPin size={14} className="shrink-0 text-arena-primary" />
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-[13px] font-semibold text-arena-text placeholder:text-arena-text-muted focus:outline-none"
                  placeholder={t("locationMap.placeholder")}
                />
                {saving ? (
                  <Loader2
                    size={14}
                    className="shrink-0 animate-spin text-arena-primary"
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="shrink-0 text-arena-success hover:text-arena-success/80"
                      aria-label={t("locationMap.saveAriaLabel")}
                    >
                      <Check size={15} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="shrink-0 text-arena-text-muted hover:text-arena-text"
                      aria-label={t("locationMap.cancelAriaLabel")}
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </>
                )}
              </div>
              {editError && (
                <p className="mt-1 px-1 text-[11px] text-arena-danger">
                  {editError}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-2.5 flex items-start gap-2 rounded-[10px] border border-arena-border bg-arena-bg px-3 py-2.5">
              <MapPin
                size={14}
                className="mt-0.5 shrink-0 text-arena-primary"
              />
              <span className="flex-1 text-[13px] font-semibold leading-snug text-arena-text">
                {location}
              </span>
              <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
                {canEdit && eventId && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-arena-text-muted transition-colors hover:text-arena-primary"
                    aria-label={t("locationMap.editAriaLabel")}
                  >
                    <Pencil size={13} strokeWidth={2} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={copyAddress}
                  className="text-arena-text-muted transition-colors hover:text-arena-text"
                  aria-label={t("locationMap.copyAriaLabel")}
                >
                  {copiedAddr ? (
                    <Check
                      size={14}
                      className="text-arena-success"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-1.5">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface-el text-[12px] font-semibold text-arena-text-sec no-underline transition-colors hover:bg-arena-surface hover:text-arena-text"
            >
              <ExternalLink size={12} />
              Google
            </a>
            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface-el text-[12px] font-semibold text-arena-text-sec no-underline transition-colors hover:bg-arena-surface hover:text-arena-text"
            >
              <ExternalLink size={12} />
              Apple Maps
            </a>
          </div>
        </div>
      </div>

      {/* Share Location */}
      <div className="rounded-[14px] border border-arena-border bg-arena-surface p-3.5">
        <div className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
          {t("locationMap.shareTitle")}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="flex flex-1 flex-col items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface-el py-2.5 text-[11px] font-semibold text-arena-text-sec transition-colors hover:border-arena-primary/30 hover:bg-arena-primary/10 hover:text-arena-primary"
          >
            {copiedLink ? (
              <Check
                size={18}
                className="text-arena-primary"
                strokeWidth={2.5}
              />
            ) : (
              <Copy size={18} />
            )}
            {copiedLink ? t("locationMap.copied") : t("locationMap.copyLink")}
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 flex-col items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface-el py-2.5 text-[11px] font-semibold text-arena-text-sec no-underline transition-colors hover:border-[#25d366]/30 hover:bg-[#25d366]/10 hover:text-[#25d366]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>

          <a
            href={tgUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 flex-col items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface-el py-2.5 text-[11px] font-semibold text-arena-text-sec no-underline transition-colors hover:border-[#2ca5e0]/30 hover:bg-[#2ca5e0]/10 hover:text-[#2ca5e0]"
          >
            <Send size={18} />
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
