import {
  BaseSignerWalletAdapter,
  WalletName,
  WalletReadyState,
  WalletConnectionError,
  WalletDisconnectionError,
  WalletSignTransactionError,
  WalletSendTransactionError,
  type SendTransactionOptions,
} from "@solana/wallet-adapter-base";
import type {
  Transaction,
  VersionedTransaction,
  Connection,
  TransactionSignature,
} from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import {
  isSMWABridgeAvailable,
  smwaConnect,
  smwaDisconnect,
  smwaSignTransactions,
  smwaSignAndSendTransactions,
} from "./smwaBridge";

/**
 * Extract a valid base58 transaction signature from the bridge result.
 * The native Android bridge may return results in various formats depending
 * on how the Java/Kotlin side serializes the callback data.
 */
function extractSignature(result: any): string | null {
  // Case 1: string[] array — most common expected format
  if (Array.isArray(result) && result.length > 0) {
    const first = typeof result[0] === "string" ? result[0].trim() : null;
    if (first && isBase58Signature(first)) return first;
    // Maybe each element is JSON-encoded?
    if (first) {
      try {
        const parsed = JSON.parse(first);
        if (typeof parsed === "string" && isBase58Signature(parsed)) return parsed;
      } catch {}
    }
    // Return first string even if it doesn't look like base58 (let RPC validate)
    if (first) return first;
  }

  // Case 2: raw string — could be JSON array or single signature
  if (typeof result === "string") {
    const trimmed = result.trim();
    // Try JSON parse (e.g., '["5abc..."]')
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
        return parsed[0].trim();
      }
      if (typeof parsed === "string") return parsed.trim();
    } catch {}
    // Maybe it's a raw signature string
    if (isBase58Signature(trimmed)) return trimmed;
    // Return as-is as last resort
    if (trimmed.length > 10) return trimmed;
  }

  // Case 3: object with a signature field
  if (result && typeof result === "object" && !Array.isArray(result)) {
    const sig = result.signature || result.signatures?.[0] || result.txSignature;
    if (typeof sig === "string") return sig.trim();
  }

  return null;
}

/** Check if a string looks like a valid Solana base58 transaction signature (43-88 chars). */
function isBase58Signature(s: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{43,88}$/.test(s);
}

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

  /**
   * Override sendTransaction to use the native bridge's signAndSendTransactions.
   * This bypasses the problematic signTransaction → deserialize flow that causes
   * "versioned message must be deserialized with VersionedMessage.deserialize()"
   * errors. The native wallet handles signing + sending internally and returns
   * just the transaction signature.
   */
  async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    _options?: SendTransactionOptions
  ): Promise<TransactionSignature> {
    if (!this._publicKey) throw new WalletSendTransactionError("Not connected");

    try {
      const serialized = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      } as any);

      const base64 = Buffer.from(serialized).toString("base64");
      console.log("[SMWA] Sending tx via signAndSendTransactions bridge");

      const result = await smwaSignAndSendTransactions([base64]);
      console.log("[SMWA] Bridge raw result:", JSON.stringify(result), "type:", typeof result);

      // The native bridge may return results in various formats:
      // - string[] (array of signature strings)
      // - string (JSON-encoded array, or single signature)
      // - object with signatures property
      const sig = extractSignature(result);
      if (!sig) {
        throw new Error(`No valid signature from bridge. Raw: ${JSON.stringify(result)?.slice(0, 200)}`);
      }

      console.log("[SMWA] Transaction sent, signature:", sig);
      return sig;
    } catch (e: any) {
      if (e instanceof WalletSendTransactionError) throw e;
      throw new WalletSendTransactionError(e?.message || "Send failed");
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
