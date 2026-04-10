"use client";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { type ReactNode, useMemo } from "react";

// Importar CSS do modal do wallet adapter
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaWalletProviderProps {
  children: ReactNode;
}

// Provider isolado para Solana — não interfere com o auth existente
// As wallets são auto-detectadas via Wallet Standard (Phantom, Solflare, Backpack, etc.)
export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []);

  // Lista vazia → Wallet Standard auto-deteta wallets instaladas no browser
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
