"use client";

import {
  Download,
  ExternalLink,
  FileWarning,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaymentProofViewerProps {
  proofUrl?: string;
  alt: string;
  onRequest: () => void;
  requesting: boolean;
  requestLabel: string;
  requestAgainLabel: string;
  missingTitle: string;
  missingDescription: string;
  brokenTitle: string;
  brokenDescription: string;
  openLabel: string;
  downloadLabel: string;
  loadingLabel: string;
  receivedKicker: string;
  receivedTitle: string;
  receivedDescription: string;
}

export function PaymentProofViewer({
  proofUrl,
  alt,
  onRequest,
  requesting,
  requestLabel,
  requestAgainLabel,
  missingTitle,
  missingDescription,
  brokenTitle,
  brokenDescription,
  openLabel,
  downloadLabel,
  loadingLabel,
  receivedKicker,
  receivedTitle,
  receivedDescription,
}: PaymentProofViewerProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    setImageFailed(false);
    setImageReady(false);
    if (!proofUrl) return;

    const image = new window.Image();
    image.onload = () => setImageReady(true);
    image.onerror = () => setImageFailed(true);
    image.src = proofUrl;
  }, [proofUrl]);

  const hasUsableProof = Boolean(proofUrl) && imageReady && !imageFailed;

  if (proofUrl && !imageReady && !imageFailed) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-[16px] border border-arena-border bg-arena-bg/45 text-arena-text-sec">
        <Loader2 className="mr-2 animate-spin text-arena-primary" size={18} />
        {loadingLabel}
      </div>
    );
  }

  if (!hasUsableProof) {
    const hasBrokenProof = Boolean(proofUrl) && imageFailed;

    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[16px] border border-dashed border-arena-border bg-arena-bg/45 px-6 py-12 text-center">
        <div
          className={cn(
            "mb-4 flex size-14 items-center justify-center rounded-[16px] border",
            hasBrokenProof
              ? "border-arena-warning/30 bg-arena-warning/10 text-arena-warning"
              : "border-arena-primary/25 bg-arena-primary/10 text-arena-primary",
          )}
        >
          {hasBrokenProof ? (
            <FileWarning size={26} />
          ) : (
            <ShieldCheck size={26} />
          )}
        </div>
        <h3 className="font-sora text-[17px] font-bold text-arena-text">
          {hasBrokenProof ? brokenTitle : missingTitle}
        </h3>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed text-arena-text-sec">
          {hasBrokenProof ? brokenDescription : missingDescription}
        </p>
        <Button
          type="button"
          onClick={onRequest}
          disabled={requesting}
          className="mt-6 rounded-[14px] bg-arena-primary px-5 text-[13px] font-bold text-arena-bg hover:bg-arena-primary/90"
        >
          {requesting ? (
            <Loader2 className="mr-2 animate-spin" size={16} />
          ) : (
            <Mail className="mr-2" size={16} />
          )}
          {hasBrokenProof ? requestAgainLabel : requestLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(320px,520px)_1fr]">
      <div
        role="img"
        aria-label={alt}
        className="relative aspect-[4/5] overflow-hidden rounded-[18px] border border-arena-border bg-arena-bg bg-contain bg-center bg-no-repeat shadow-[0_32px_80px_-56px_rgba(0,0,0,.95)]"
        style={{ backgroundImage: `url(${proofUrl})` }}
      />
      <div className="flex flex-col justify-between rounded-[16px] border border-arena-border bg-arena-bg/45 p-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-arena-text-muted">
            {receivedKicker}
          </p>
          <h3 className="mt-2 font-sora text-[18px] font-bold text-arena-text">
            {receivedTitle}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-arena-text-sec">
            {receivedDescription}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            asChild
            variant="outline"
            className="rounded-[12px] border-arena-border bg-arena-surface text-arena-text hover:border-arena-primary/40 hover:bg-arena-primary/10 hover:text-arena-primary"
          >
            <a href={proofUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2" size={16} />
              {openLabel}
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="rounded-[12px] text-arena-text-sec hover:bg-arena-surface-el hover:text-arena-text"
          >
            <a href={proofUrl} download>
              <Download className="mr-2" size={16} />
              {downloadLabel}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
