import { Send } from "lucide-react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SquadPlayer } from "@/hooks/use-squad";

type TranslationFn = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

interface SquadEmailSheetProps {
  emailFeedback: string | null;
  emailLimit: number;
  emailMessage: string;
  emailPlayer: SquadPlayer;
  emailSubject: string;
  emailUsage: number;
  isSendingEmail: boolean;
  onClose: () => void;
  onEmailMessageChange: (value: string) => void;
  onEmailSubjectChange: (value: string) => void;
  onSend: () => void;
  t: TranslationFn;
}

export function SquadEmailSheet({
  emailFeedback,
  emailLimit,
  emailMessage,
  emailPlayer,
  emailSubject,
  emailUsage,
  isSendingEmail,
  onClose,
  onEmailMessageChange,
  onEmailSubjectChange,
  onSend,
  t,
}: SquadEmailSheetProps) {
  return (
    <BottomSheet
      title={t("email.title", { name: emailPlayer.name })}
      onClose={onClose}
    >
      <div className="space-y-3 overflow-auto">
        <div className="rounded-[14px] border border-arena-border bg-arena-surface px-3 py-2 text-[12px] text-arena-text-sec">
          {Number.isFinite(emailLimit)
            ? t("email.usage", { used: emailUsage, limit: emailLimit })
            : t("email.unlimited")}
        </div>
        <Input
          value={emailSubject}
          onChange={event => onEmailSubjectChange(event.target.value)}
          placeholder={t("email.subject")}
          className="border-arena-border bg-arena-surface text-arena-text"
        />
        <Textarea
          value={emailMessage}
          onChange={event => onEmailMessageChange(event.target.value)}
          placeholder={t("email.message")}
          className="min-h-32 border-arena-border bg-arena-surface text-arena-text"
        />
        {emailFeedback && (
          <div className="rounded-[12px] border border-arena-border bg-arena-bg px-3 py-2 text-[12px] text-arena-text-sec">
            {emailFeedback}
          </div>
        )}
        <Cta
          variant="primary"
          size="md"
          fullWidth
          onClick={onSend}
          disabled={
            isSendingEmail ||
            !emailSubject.trim() ||
            !emailMessage.trim() ||
            emailUsage >= emailLimit
          }
        >
          <Send size={15} />
          {t("email.send")}
        </Cta>
      </div>
    </BottomSheet>
  );
}
