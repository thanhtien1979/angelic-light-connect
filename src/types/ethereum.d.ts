declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<string[]>;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
      // MetaMask
      isMetaMask?: boolean;
      // Trust Wallet
      isTrust?: boolean;
      isTrustWallet?: boolean;
      // Bitget Wallet
      isBitKeep?: boolean;
      isBitget?: boolean;
      // Coinbase Wallet
      isCoinbaseWallet?: boolean;
      isCoinbaseBrowser?: boolean;
      // OKX Wallet
      isOkxWallet?: boolean;
      isOKExWallet?: boolean;
    };
  }
}

export {};
