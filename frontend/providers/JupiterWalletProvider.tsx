"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";

// Dynamically import with ssr: false because wallet adapter uses browser APIs
const JupiterWalletProviderClient = dynamic(
  () => import("./JupiterWalletProviderClient"),
  { ssr: false }
);

interface JupiterWalletProviderProps {
  children: ReactNode;
}

export function JupiterWalletProvider({
  children,
}: JupiterWalletProviderProps) {
  return (
    <JupiterWalletProviderClient>{children}</JupiterWalletProviderClient>
  );
}
