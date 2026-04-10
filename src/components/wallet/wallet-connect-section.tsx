"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { CheckCircle2, Loader2, Unlink, Wallet } from "lucide-react";
import { useState } from "react";
import { linkWallet, unlinkWallet } from "@/actions/wallet";
import { useToast } from "@/hooks/use-toast-custom";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface WalletConnectSectionProps {
  // Variant controla o estilo visual para manter coerência entre ecrãs
  variant?: "onboarding" | "profile";
  // walletId preenchido quando já existe wallet ligada (para desligar)
  existingWalletId?: number;
  existingAddress?: string;
  onLinked?: (address: string) => void;
  onUnlinked?: () => void;
  className?: string;
}

function shortAddr(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// Ícone Solana como SVG inline (sem dependências extra)
function SolanaLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <title>Solana</title>
      <path
        d="M21.4 93.6a3.5 3.5 0 0 1 2.5-1h98.6a1.8 1.8 0 0 1 1.2 3l-20.7 20.7a3.5 3.5 0 0 1-2.5 1H4a1.8 1.8 0 0 1-1.2-3L21.4 93.6Z"
        fill="url(#sol-a)"
      />
      <path
        d="M21.4 12.7a3.6 3.6 0 0 1 2.5-1h98.6a1.8 1.8 0 0 1 1.2 3L102.9 35.4a3.5 3.5 0 0 1-2.5 1H1.8a1.8 1.8 0 0 1-1.2-3L21.4 12.7Z"
        fill="url(#sol-b)"
      />
      <path
        d="M102.9 52.8a3.5 3.5 0 0 0-2.5-1H1.8a1.8 1.8 0 0 0-1.2 3L21.4 75.5a3.5 3.5 0 0 0 2.5 1h98.6a1.8 1.8 0 0 0 1.2-3L102.9 52.8Z"
        fill="url(#sol-c)"
      />
      <defs>
        <linearGradient
          id="sol-a"
          x1="6"
          y1="117"
          x2="121"
          y2="117"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
        <linearGradient
          id="sol-b"
          x1="6"
          y1="24"
          x2="121"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
        <linearGradient
          id="sol-c"
          x1="6"
          y1="64"
          x2="121"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function WalletConnectSection({
  variant = "onboarding",
  existingWalletId,
  existingAddress,
  onLinked,
  onUnlinked,
  className,
}: WalletConnectSectionProps) {
  const { data: session } = useSession();
  const {
    publicKey,
    connected,
    disconnect,
    wallet: adapterWallet,
  } = useWallet();
  const { setVisible } = useWalletModal();
  const { toast } = useToast();

  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [linked, setLinked] = useState(false);

  const address = publicKey?.toBase58();
  const isLoggedIn = !!session?.user?.id;

  // ── Ligar wallet ─────────────────────────────────────────────────────────────

  async function handleLink() {
    if (!session?.user?.id || !address) return;
    setLinking(true);
    try {
      const result = await linkWallet(
        session.user.id,
        address,
        adapterWallet?.adapter?.name ?? undefined,
      );
      if (result.success) {
        setLinked(true);
        onLinked?.(address);
        toast.success(
          "Wallet associada!",
          `${shortAddr(address)} está agora ligada à tua conta.`,
        );
      } else {
        toast.error("Erro", result.error ?? "Não foi possível ligar a wallet.");
      }
    } finally {
      setLinking(false);
    }
  }

  // ── Desligar wallet existente ─────────────────────────────────────────────────

  async function handleUnlink() {
    if (!session?.user?.id || !existingWalletId) return;
    setUnlinking(true);
    try {
      const result = await unlinkWallet(session.user.id, existingWalletId);
      if (result.success) {
        onUnlinked?.();
        toast.success(
          "Wallet desligada",
          "A wallet foi removida da tua conta.",
        );
      } else {
        toast.error(
          "Erro",
          result.error ?? "Não foi possível desligar a wallet.",
        );
      }
    } finally {
      setUnlinking(false);
    }
  }

  // ── Estilos por variante ──────────────────────────────────────────────────────

  const cardClass = cn(
    variant === "onboarding"
      ? "rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5"
      : "rounded-[24px] border border-white/8 bg-white/5 p-6",
    className,
  );

  // ── Wallet já ligada (vinda do servidor) ─────────────────────────────────────

  if (existingAddress) {
    return (
      <div className={cardClass}>
        <Header />
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#14F195]/20 bg-[#14F195]/5 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#9945FF]/20">
            <SolanaLogo className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/40">Solana</p>
            <p className="font-mono text-sm text-white/80">
              {shortAddr(existingAddress)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleUnlink}
            disabled={unlinking}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/8 hover:text-red-400 disabled:opacity-50"
            aria-label="Desligar wallet"
          >
            {unlinking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Unlink className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Utilizador não autenticado (ex: onboarding antes do login) ───────────────

  if (!isLoggedIn) {
    return (
      <div className={cardClass}>
        <Header />
        <p className="mt-3 text-xs leading-relaxed text-white/45">
          Podes ligar a tua wallet Solana após criares a tua conta, nas
          definições do perfil.
        </p>
      </div>
    );
  }

  // ── Wallet ligada com sucesso nesta sessão ────────────────────────────────────

  if (linked && address) {
    return (
      <div className={cardClass}>
        <Header />
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#14F195]/20 bg-[#14F195]/5 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#14F195]" />
          <span className="text-sm font-medium text-[#14F195]">
            Wallet associada
          </span>
          <span className="ml-auto font-mono text-xs text-white/40">
            {shortAddr(address)}
          </span>
        </div>
      </div>
    );
  }

  // ── Estado normal: conectar ───────────────────────────────────────────────────

  return (
    <div className={cardClass}>
      <Header />

      <div className="mt-4 space-y-3">
        {!connected ? (
          <>
            {/* Ligar wallet existente */}
            <button
              type="button"
              onClick={() => setVisible(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:border-white/25 hover:bg-white/10"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#9945FF]/20">
                <SolanaLogo className="h-4 w-4" />
              </div>
              <span>Ligar wallet existente</span>
              <span className="ml-auto text-white/30">→</span>
            </button>

            {/* Criar nova wallet — preparado para embedded wallet futura */}
            <button
              type="button"
              disabled
              className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-white/30 opacity-60 cursor-not-allowed"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5">
                <Wallet className="h-4 w-4" />
              </div>
              <span>Criar nova wallet</span>
              <span className="ml-auto rounded-full border border-white/10 px-2 py-0.5 text-[10px] tracking-widest text-white/25 uppercase">
                Em breve
              </span>
            </button>
          </>
        ) : (
          /* Wallet conectada no browser — confirmar ligação à conta */
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-[#14F195]/20 bg-[#14F195]/5 px-4 py-3">
              <div className="h-2 w-2 shrink-0 rounded-full bg-[#14F195] animate-pulse" />
              <span className="min-w-0 flex-1 truncate font-mono text-sm text-white/75">
                {address}
              </span>
              <button
                type="button"
                onClick={() => disconnect()}
                className="ml-2 shrink-0 text-xs text-white/30 transition-colors hover:text-white/60"
              >
                Trocar
              </button>
            </div>

            <button
              type="button"
              onClick={handleLink}
              disabled={linking}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#14F195]/30 bg-[#14F195]/10 px-4 py-3 text-sm font-medium text-[#14F195] transition-all hover:bg-[#14F195]/20 disabled:opacity-50"
            >
              {linking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Associar à conta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Cabeçalho partilhado ─────────────────────────────────────────────────────

function Header() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#9945FF]/15">
        <SolanaLogo className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">Wallet Solana</p>
        <p className="text-xs text-white/40">Opcional</p>
      </div>
      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] tracking-widest text-white/30 uppercase">
        Opcional
      </span>
    </div>
  );
}
