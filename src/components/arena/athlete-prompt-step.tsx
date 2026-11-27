"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Shield, Shirt } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { setMyAthleteStatus } from "@/actions/team-staff.actions";
import { useTeams } from "@/hooks/use-teams";
import { useToast } from "@/hooks/use-toast-custom";
import { invalidateRosterQueries, staffErrorKey } from "@/lib/staff-ui";
import { Button } from "../ui/button";
import { BottomSheet } from "./bottom-sheet";

interface AthletePromptStepProps {
  teamId: number;
  teamName: string;
  onClose: () => void;
}

/** Post-create step: the owner chooses whether to join the roster. */
export function AthletePromptStep({
  teamId,
  teamName,
  onClose,
}: AthletePromptStepProps) {
  const t = useTranslations("arenaCreateTeam");
  const tStaff = useTranslations("teamStaff");
  const { toast } = useToast();
  const { refetch } = useTeams();
  const queryClient = useQueryClient();
  const [joining, setJoining] = useState(false);

  const handleJoinRoster = async () => {
    setJoining(true);
    try {
      const result = await setMyAthleteStatus({ teamId, isAthlete: true });
      if (result.success) {
        await Promise.all([refetch(), invalidateRosterQueries(queryClient)]);
      }
      // The choice can be retried from the profile toggle.
      else toast.error(tStaff(staffErrorKey(result.error.code)));
    } catch {
      toast.error(tStaff(staffErrorKey(undefined)));
    } finally {
      setJoining(false);
    }
    onClose();
  };

  return (
    <BottomSheet onClose={onClose}>
      <div className="flex flex-col items-center gap-3.5 overflow-auto px-5 pt-8 pb-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-arena-primary/10 text-arena-primary">
          <Shield size={32} />
        </div>
        <p className="text-lg font-bold text-arena-text">
          {t("success", { name: teamName })}
        </p>
        <p className="text-sm text-arena-text-sec">{t("successSubtitle")}</p>

        <div className="mt-3 w-full rounded-[16px] border border-arena-border bg-arena-surface p-4 text-left">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-arena-primary/20 bg-arena-primary/10 text-arena-primary">
              <Shirt size={16} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-arena-text">
                {t("athletePrompt.title")}
              </p>
              <p className="mt-0.5 text-[12px] text-arena-text-muted">
                {t("athletePrompt.sub")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-1 flex w-full flex-col gap-2.5 md:flex-row-reverse">
          <Button
            className="press h-[50px] w-full rounded-[14px] bg-arena-primary text-[15px] font-bold text-arena-bg hover:bg-arena-primary/90 md:flex-1"
            disabled={joining}
            onClick={handleJoinRoster}
            type="button"
          >
            {joining ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Check size={16} strokeWidth={2.5} />
            )}
            {t("athletePrompt.yes")}
          </Button>
          <Button
            className="press h-[50px] w-full rounded-[14px] border border-arena-border bg-arena-surface text-[15px] font-bold text-arena-text-sec hover:bg-arena-surface-el md:flex-1"
            disabled={joining}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            {t("athletePrompt.no")}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
