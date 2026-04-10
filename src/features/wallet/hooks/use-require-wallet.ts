"use client";

import { useEffect, useState } from "react";
import { getUserWallets } from "@/actions/wallet";
import { useSession } from "@/lib/auth-client";

interface WalletEntry {
  id: number;
  address: string;
  provider: string | null;
}

interface UseRequireWalletResult {
  hasWallet: boolean;
  isLoading: boolean;
  wallets: WalletEntry[];
}

/**
 * Guard hook for features that require a linked Solana wallet.
 *
 * Usage:
 *   const { hasWallet, isLoading, wallets } = useRequireWallet();
 *   if (isLoading) return <Spinner />;
 *   if (!hasWallet) return <WalletConnectSection variant="profile" />;
 */
export function useRequireWallet(): UseRequireWalletResult {
  const { data: session } = useSession();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setWallets([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getUserWallets(userId)
      .then(result => {
        if (!cancelled) {
          setWallets(
            result.success && result.data
              ? result.data.map(w => ({
                  id: w.id,
                  address: w.address,
                  provider: w.provider ?? null,
                }))
              : [],
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return {
    hasWallet: wallets.length > 0,
    isLoading,
    wallets,
  };
}
