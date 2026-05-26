"use client";

import {
  CheckCircle2,
  Loader2,
  Lock,
  Smartphone,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { passkey } from "@/lib/auth-client";

interface ProfileSecuritySheetProps {
  passkeysCount: number;
  onClose: () => void;
}

export function ProfileSecuritySheet({ passkeysCount, onClose }: ProfileSecuritySheetProps) {
  const t = useTranslations("profilePage");
  const [passkeyStatus, setPasskeyStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [hasPasskey, setHasPasskey] = useState<boolean>(passkeysCount > 0 || true);

  const handleRegisterPasskey = async () => {
    setPasskeyStatus("adding");
    try {
      const result = await passkey.addPasskey();
      if (result?.error) throw new Error(result.error.message);
      setPasskeyStatus("added");
      setHasPasskey(true);
      setTimeout(() => setPasskeyStatus("idle"), 2500);
    } catch {
      setPasskeyStatus("error");
      setTimeout(() => setPasskeyStatus("idle"), 2500);
    }
  };

  return (
    <BottomSheet title={t("securitySheet.title")} onClose={onClose} noPad>
      <div className="px-5 py-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
        <Tabs defaultValue="passkeys" className="w-full">
          <TabsList className="grid grid-cols-3 bg-arena-surface border border-arena-border/80 p-1 rounded-xl h-11">
            <TabsTrigger
              value="passkeys"
              className="rounded-lg font-bold text-xs data-[state=active]:bg-arena-primary data-[state=active]:text-[#0B0F14]"
            >
              {t("securitySheet.tabs.passkeys")}
            </TabsTrigger>
            <TabsTrigger
              value="sessions"
              className="rounded-lg font-bold text-xs data-[state=active]:bg-arena-primary data-[state=active]:text-[#0B0F14]"
            >
              {t("securitySheet.tabs.sessions")}
            </TabsTrigger>
            <TabsTrigger
              value="2fa"
              className="rounded-lg font-bold text-xs data-[state=active]:bg-arena-primary data-[state=active]:text-[#0B0F14]"
            >
              {t("securitySheet.tabs.twoFactor")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passkeys" className="mt-4 flex flex-col gap-4">
            {hasPasskey ? (
              <div className="bg-arena-surface border border-arena-border rounded-[14px] p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-arena-primary/10 flex items-center justify-center text-arena-primary border border-arena-primary/20">
                    <Smartphone className="w-5 h-5 text-arena-primary" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-arena-text">iPhone — Face ID</span>
                      <div className="w-3.5 h-3.5 rounded-full bg-arena-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="w-2.5 h-2.5 text-arena-primary" strokeWidth={2.5} />
                      </div>
                    </div>
                    <span className="text-xs text-arena-text-muted block mt-0.5">
                      {t("securitySheet.addedOn", { date: "12 Abr" })} ·{" "}
                      <span className="text-arena-primary font-medium">
                        {t("securitySheet.deviceActive")}
                      </span>
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setHasPasskey(false)}
                  variant="outline"
                  size="sm"
                  className="bg-arena-bg-sec border border-arena-border text-arena-text hover:bg-arena-surface-el font-bold text-xs px-3 h-8 rounded-lg"
                >
                  {t("securitySheet.remove")}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-arena-border rounded-xl flex flex-col items-center justify-center p-4">
                <Smartphone className="w-8 h-8 text-arena-text-muted mb-2" strokeWidth={1.5} />
                <span className="text-sm font-bold text-arena-text">{t("security.noPasskeys")}</span>
                <span className="text-xs text-arena-text-muted mt-1 max-w-[280px]">
                  {t("security.passkeysDesc")}
                </span>
              </div>
            )}

            <Button
              onClick={handleRegisterPasskey}
              disabled={passkeyStatus === "adding"}
              className="w-full bg-arena-primary text-[#0B0F14] hover:bg-arena-primary/90 font-bold h-11 rounded-xl text-sm transition-all gap-1.5"
            >
              {passkeyStatus === "adding" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
              {passkeyStatus === "adding" ? t("actions.saving") : t("actions.addPasskey")}
            </Button>
          </TabsContent>

          <TabsContent value="sessions" className="mt-4">
            <div className="bg-arena-surface border border-arena-border rounded-[14px] p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-arena-primary/10 flex items-center justify-center text-arena-primary border border-arena-primary/20">
                  <Smartphone className="w-5 h-5 text-arena-primary" strokeWidth={1.8} />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-arena-text block">iPhone (Safari)</span>
                  <span className="text-xs text-arena-text-muted block mt-0.5">
                    Lisboa, Portugal · 192.168.1.10
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-arena-primary/15 text-arena-primary border border-arena-primary/20">
                {t("securitySheet.currentSession")}
              </span>
            </div>
          </TabsContent>

          <TabsContent
            value="2fa"
            className="mt-4 text-center py-6 border border-arena-border rounded-xl bg-arena-surface p-4"
          >
            <Lock className="w-8 h-8 text-arena-text-muted mx-auto mb-2" strokeWidth={1.5} />
            <span className="text-sm font-bold text-arena-text block">
              {t("securitySheet.twoFactor.title")}
            </span>
            <span className="text-xs text-arena-text-muted mt-1 block max-w-[280px] mx-auto">
              {t("securitySheet.twoFactor.description")}
            </span>
          </TabsContent>
        </Tabs>
      </div>
    </BottomSheet>
  );
}
