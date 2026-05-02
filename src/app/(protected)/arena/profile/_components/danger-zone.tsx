"use client";

import { AlertTriangle, Clock, Loader2, Mail, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import {
  cancelTransferRequest,
  deleteAccount,
  transferAccount,
} from "@/actions/account.actions";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface PendingTransfer {
  id: number;
  newEmail: string;
  createdAt: Date;
  expiresAt: Date;
}

interface DangerZoneProps {
  pendingTransfer: PendingTransfer | null;
}

export function DangerZone({ pendingTransfer: initialPending }: DangerZoneProps) {
  const t = useTranslations("profileDangerZone");
  const [newEmail, setNewEmail] = useState("");
  const [isDeleting, startDelete] = useTransition();
  const [isTransferring, startTransfer] = useTransition();
  const [isCancelling, startCancel] = useTransition();
  const [pending, setPending] = useState<PendingTransfer | null>(initialPending);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    startDelete(async () => {
      const result = await deleteAccount({});
      if (result.success) {
        await authClient.signOut();
        window.location.href = "/auth";
      } else {
        setError("DELETE_FAILED");
      }
    });
  }

  async function handleTransfer() {
    if (!newEmail) return;
    startTransfer(async () => {
      setError(null);
      const result = await transferAccount({ newEmail });
      if (result.success) {
        setPending({
          id: Date.now(), // optimistic — server will revalidate
          newEmail,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        });
        setNewEmail("");
      } else {
        setError(result.error?.code || "TRANSFER_FAILED");
      }
    });
  }

  async function handleCancel() {
    if (!pending) return;
    startCancel(async () => {
      const result = await cancelTransferRequest({ requestId: pending.id });
      if (result.success) {
        setPending(null);
      }
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <AlertTriangle className="size-4 text-red-500" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-red-500">
          {t("title")}
        </h2>
      </div>

      <div className="grid gap-4">
        {/* Account Transfer */}
        <div className="jb-card border-arena-border/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-arena-text">
                {t("transfer.title")}
              </h3>
              <p className="text-sm text-arena-text-sec">
                {t("transfer.description")}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {pending ? (
              /* Persistent pending transfer message */
              <div className="rounded-xl border border-arena-warning/25 bg-arena-warning/8 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-arena-warning/15">
                      <Clock size={15} className="text-arena-warning" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-arena-text">
                        Pedido de transferência pendente
                      </p>
                      <p className="text-xs text-arena-text-muted">
                        A aguardar confirmação para{" "}
                        <span className="font-mono font-semibold text-arena-warning">
                          {pending.newEmail}
                        </span>
                      </p>
                      <p className="text-[11px] text-arena-text-muted">
                        Expira em{" "}
                        {new Intl.DateTimeFormat("pt", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(pending.expiresAt))}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/8 px-2.5 py-1.5 text-[11px] font-semibold text-red-400 transition-colors hover:bg-red-500/15 disabled:opacity-50"
                  >
                    {isCancelling ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <X size={11} />
                    )}
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* Transfer form */
              <div className="space-y-2">
                <Label
                  className="text-arena-text-sec"
                  htmlFor="transfer-email"
                >
                  {t("transfer.label")}
                </Label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    className="flex-1 border-arena-border bg-arena-surface text-arena-text"
                    id="transfer-email"
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder={t("transfer.placeholder")}
                    type="email"
                    value={newEmail}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="bg-arena-surface-el text-arena-text hover:bg-arena-surface-el/80"
                        disabled={!newEmail || isTransferring}
                        variant="outline"
                      >
                        {isTransferring ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Mail className="mr-2 size-4" />
                        )}
                        {t("transfer.button")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-arena-border bg-arena-surface shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-arena-text">
                          {t("transfer.confirm.title")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-arena-text-sec">
                          {t("transfer.confirm.description")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-arena-border bg-transparent text-arena-text hover:bg-arena-surface-el">
                          {t("transfer.confirm.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-arena-primary text-[#0B0F14] hover:bg-arena-primary/90"
                          onClick={handleTransfer}
                        >
                          {t("transfer.confirm.action")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs font-medium text-red-400">
                {error === "EMAIL_ALREADY_IN_USE"
                  ? "Este email já está em uso."
                  : "Erro ao processar. Tenta novamente."}
              </p>
            )}
          </div>
        </div>

        {/* Account Deletion */}
        <div className="jb-card border-red-500/20 bg-red-500/5 p-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h3 className="font-bold text-red-500">{t("delete.title")}</h3>
              <p className="text-sm text-arena-text-sec">
                {t("delete.description")}
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                  disabled={isDeleting}
                  variant="outline"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 size-4" />
                  )}
                  {t("delete.button")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-red-500/30 bg-arena-surface shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-arena-text">
                    {t("delete.confirm.title")}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-arena-text-sec">
                    {t("delete.confirm.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-arena-border bg-transparent text-arena-text hover:bg-arena-surface-el">
                    {t("delete.confirm.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={handleDelete}
                  >
                    {t("delete.confirm.action")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </section>
  );
}
