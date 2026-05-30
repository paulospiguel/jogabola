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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  const isPdf = Boolean(proofUrl?.split("?")[0].toLowerCase().endsWith(".pdf"));

  useEffect(() => {
    setImageFailed(false);
    setImageReady(false);
    if (!proofUrl) return;

    // PDFs can't be probed via Image(); treat as ready and embed below.
    if (proofUrl.split("?")[0].toLowerCase().endsWith(".pdf")) {
      setImageReady(true);
      return;
    }

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
    <div className="flex flex-col md:flex-row md:items-center justify-between rounded-[16px] border border-arena-border bg-arena-bg/45 p-5 gap-6">
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-arena-text-muted">
          {receivedKicker}
        </p>
        <h3 className="mt-2 font-sora text-[18px] font-bold text-arena-text">
          {receivedTitle}
        </h3>
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-arena-text-sec">
          {receivedDescription}
        </p>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="rounded-[14px] bg-arena-primary px-6 h-12 text-[14px] font-bold text-arena-bg hover:bg-arena-primary/90 shadow-[0_0_20px_-5px_rgba(124,255,79,0.4)] transition-all shrink-0"
          >
            <ExternalLink className="mr-2" size={18} />
            {openLabel}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] md:max-w-2xl bg-arena-surface border-arena-border p-0 overflow-hidden flex flex-col h-[85vh] md:h-auto md:max-h-[85vh]">
          <DialogHeader className="p-4 border-b border-arena-border/50 shrink-0">
            <DialogTitle className="text-arena-text font-sora">{openLabel}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-0 bg-black flex justify-center items-center min-h-[300px] overflow-hidden">
            {isPdf ? (
              <iframe
                title={alt}
                src={proofUrl}
                className="w-full h-full bg-white border-0"
              />
            ) : (
              <img
                src={proofUrl}
                alt={alt}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="p-4 bg-arena-surface flex gap-3 justify-end border-t border-arena-border/50 shrink-0">
            <Button
              asChild
              variant="outline"
              className="rounded-[12px] border-arena-border bg-arena-bg text-arena-text hover:border-arena-primary/40 hover:bg-arena-primary/10 hover:text-arena-primary flex-1 sm:flex-none"
            >
              <a href={proofUrl} download>
                <Download className="mr-2" size={16} />
                {downloadLabel}
              </a>
            </Button>
            <Button
              asChild
              className="rounded-[12px] bg-arena-primary text-arena-bg hover:bg-arena-primary/90 flex-1 sm:flex-none"
            >
              <a href={proofUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2" size={16} />
                Abrir Externamente
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
