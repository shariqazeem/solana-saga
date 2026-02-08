import {
  BaseSignerWalletAdapter,
  WalletName,
  WalletReadyState,
  WalletConnectionError,
  WalletDisconnectionError,
  WalletSignTransactionError,
} from "@solana/wallet-adapter-base";
import type { Transaction, VersionedTransaction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import {
  isSMWABridgeAvailable,
  smwaConnect,
  smwaDisconnect,
  smwaSignTransactions,
} from "./smwaBridge";

export class SMWAWalletAdapter extends BaseSignerWalletAdapter {
  name = "Jupiter Mobile" as WalletName;
  url = "https://jup.ag";
  icon =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHJ4PSI4IiBmaWxsPSIjMDAwIi8+PHBhdGggZD0iTTE4IDZhMTIgMTIgMCAxIDAgMCAyNCAxMiAxMiAwIDAgMCAwLTI0Wm0wIDIxYTkgOSAwIDEgMSAwLTE4IDkgOSAwIDAgMSAwIDE4WiIgZmlsbD0iI0M3RjI4NCIvPjxjaXJjbGUgY3g9IjE4IiBjeT0iMTgiIHI9IjUiIGZpbGw9IiNDN0YyODQiLz48L3N2Zz4=" as const;
  supportedTransactionVersions = new Set(["legacy", 0]) as any;

  private _publicKey: PublicKey | null = null;
  private _connecting = false;

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get readyState(): WalletReadyState {
    if (typeof window === "undefined") return WalletReadyState.Unsupported;
    return isSMWABridgeAvailable()
      ? WalletReadyState.Installed
      : WalletReadyState.Unsupported;
  }

  async connect(): Promise<void> {
    if (this._publicKey) return;

    this._connecting = true;
    this.emit("connect", this._publicKey!);

    try {
      const result = await smwaConnect();
      this._publicKey = new PublicKey(result.publicKey);
      this.emit("connect", this._publicKey);
    } catch (e: any) {
      this._publicKey = null;
      throw new WalletConnectionError(e?.message || "SMWA connection failed");
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await smwaDisconnect();
    } catch (e: any) {
      throw new WalletDisconnectionError(
        e?.message || "SMWA disconnection failed"
      );
    } finally {
      this._publicKey = null;
      this.emit("disconnect");
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> {
    if (!this._publicKey) throw new WalletSignTransactionError("Not connected");

    try {
      const serialized = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      } as any);

      const base64 = Buffer.from(serialized).toString("base64");
      const signedArray = await smwaSignTransactions([base64]);

      if (!signedArray || signedArray.length === 0) {
        throw new Error("No signed transaction returned");
      }

      const signedBytes = Buffer.from(signedArray[0], "base64");

      // Detect versioned vs legacy by checking the first byte
      // Versioned transactions have a high bit set (0x80) in the first byte
      const { Transaction: LegacyTransaction, VersionedTransaction: VTx } =
        await import("@solana/web3.js");

      if (signedBytes[0] & 0x80) {
        return VTx.deserialize(signedBytes) as T;
      } else {
        return LegacyTransaction.from(signedBytes) as T;
      }
    } catch (e: any) {
      if (e instanceof WalletSignTransactionError) throw e;
      throw new WalletSignTransactionError(e?.message || "Sign failed");
    }
  }

  async signMessage(_message: Uint8Array): Promise<Uint8Array> {
    throw new Error("signMessage not supported by SMWA bridge");
  }
}
