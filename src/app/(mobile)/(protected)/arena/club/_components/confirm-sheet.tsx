"use client";

import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { ClubFormAlert } from "./club-ui";

interface ConfirmSheetProps {
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  cancelLabel: string;
  isPending: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** Destructive confirmation (DESIGN.md: always through a modal/sheet). */
export function ConfirmSheet({
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel,
  isPending,
  errorMessage,
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  return (
    <BottomSheet onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-arena-text-sec">{description}</p>
        <ClubFormAlert message={errorMessage ?? ""} />
        <div className="flex gap-2">
          <Cta
            variant="secondary"
            size="md"
            className="btn-press flex-1"
            onClick={onClose}
          >
            {cancelLabel}
          </Cta>
          <Cta
            variant="danger"
            size="md"
            className="btn-press flex-1"
            disabled={isPending}
            aria-busy={isPending}
            onClick={onConfirm}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Cta>
        </div>
      </div>
    </BottomSheet>
  );
}
