"use client";

import { Bell, Bolt, ChevronRight, Edit3, Lock, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { signOut } from "@/lib/auth-client";

type ActiveSheet = "notifications" | "security" | "edit-profile";

interface ProfileMenuProps {
  onOpenSheet: (sheet: ActiveSheet) => void;
}

async function handleLogout() {
  await signOut();
  window.location.href = "/";
}

export function ProfileMenu({ onOpenSheet }: ProfileMenuProps) {
  const t = useTranslations("profilePage");

  return (
    <>
      <div className="bg-arena-surface border border-arena-border rounded-[16px] divide-y divide-arena-border/50 overflow-hidden">
        <button
          type="button"
          onClick={() => onOpenSheet("notifications")}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors active:bg-arena-surface-el/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-arena-bg-sec/80 flex items-center justify-center text-arena-text-sec border border-arena-border/60">
              <Bell
                className="w-4.5 h-4.5 text-arena-text-sec"
                strokeWidth={1.8}
              />
            </div>
            <div>
              <span className="font-bold text-sm text-arena-text block">
                {t("menu.notifications")}
              </span>
              <span className="text-xs text-arena-text-muted block mt-0.5">
                {t("menu.notificationsSub")}
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-arena-text-muted" />
        </button>

        <button
          type="button"
          onClick={() => onOpenSheet("security")}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors active:bg-arena-surface-el/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-arena-bg-sec/80 flex items-center justify-center text-arena-text-sec border border-arena-border/60">
              <Lock
                className="w-4.5 h-4.5 text-arena-text-sec"
                strokeWidth={1.8}
              />
            </div>
            <div>
              <span className="font-bold text-sm text-arena-text block">
                {t("menu.security")}
              </span>
              <span className="text-xs text-arena-text-muted block mt-0.5">
                {t("menu.securitySub")}
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-arena-text-muted" />
        </button>

        <button
          type="button"
          onClick={() => onOpenSheet("edit-profile")}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors active:bg-arena-surface-el/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-arena-bg-sec/80 flex items-center justify-center text-arena-text-sec border border-arena-border/60">
              <Edit3
                className="w-4.5 h-4.5 text-arena-text-sec"
                strokeWidth={1.8}
              />
            </div>
            <div>
              <span className="font-bold text-sm text-arena-text block">
                {t("menu.editProfile")}
              </span>
              <span className="text-xs text-arena-text-muted block mt-0.5">
                {t("menu.editProfileSub")}
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-arena-text-muted" />
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors active:bg-arena-surface-el/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/10 flex items-center justify-center text-[#00f0ff] border border-[#00f0ff]/20">
              <Bolt className="w-4.5 h-4.5 text-[#00f0ff]" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-arena-text block">
                  {t("menu.proPlan")}
                </span>
                <span className="text-[8px] uppercase tracking-wider font-extrabold px-1 py-0.25 bg-[#00f0ff]/20 text-[#00f0ff] rounded border border-[#00f0ff]/30 leading-none">
                  PRO
                </span>
              </div>
              <span className="text-xs text-arena-text-muted block mt-0.5">
                {t("menu.proPlanSub")}
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-arena-text-muted" />
        </button>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="w-full h-12 bg-arena-danger/10 border border-arena-danger/25 text-arena-danger font-bold hover:bg-arena-danger/15 rounded-xl transition-all flex items-center justify-center gap-2 text-sm mt-2"
          >
            <LogOut className="w-4 h-4" strokeWidth={2.2} />
            {t("menu.logout")}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-arena-border bg-arena-surface shadow-2xl">
          <AlertDialogHeader className="items-center text-center sm:text-center">
            <div className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-arena-danger/10 border border-arena-danger/20">
              <LogOut className="size-5 text-arena-danger" strokeWidth={2.2} />
            </div>
            <AlertDialogTitle className="text-arena-text">
              {t("menu.logoutTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-arena-text-sec">
              {t("menu.logoutDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:justify-center">
            <AlertDialogCancel className="mt-0 flex-1 border-arena-border bg-transparent text-arena-text hover:bg-arena-surface-el">
              {t("menu.logoutCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 bg-arena-danger text-white hover:bg-arena-danger/90"
              onClick={handleLogout}
            >
              {t("menu.logoutAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
