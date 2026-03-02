/**
 * JS bridge to the native Android SMWA WalletBridge.
 *
 * The native side exposes `window.SolanaBridge` via `addJavascriptInterface()`.
 * Async results are returned by the native side calling
 * `window.__smwaResolve(callbackId, result)` or
 * `window.__smwaReject(callbackId, errorMessage)`.
 */

declare global {
  interface Window {
    SolanaBridge?: {
      isAvailable(): boolean;
      getPublicKey(): string | null;
      connect(callbackId: string): void;
      disconnect(callbackId: string): void;
      signTransactions(callbackId: string, base64TxsJson: string): void;
      signAndSendTransactions(callbackId: string, base64TxsJson: string): void;
    };
    __smwaResolve?: (callbackId: string, result: any) => void;
    __smwaReject?: (callbackId: string, error: string) => void;
  }
}

const TIMEOUT_MS = 30_000;

const pendingCallbacks = new Map<
  string,
  { resolve: (value: any) => void; reject: (reason: any) => void; timer: ReturnType<typeof setTimeout> }
>();

let callbackCounter = 0;
let installed = false;

function installGlobalHandlers() {
  if (installed) return;
  installed = true;

  window.__smwaResolve = (callbackId: string, result: any) => {
    const cb = pendingCallbacks.get(callbackId);
    if (cb) {
      clearTimeout(cb.timer);
      pendingCallbacks.delete(callbackId);
      cb.resolve(result);
    }
  };

  window.__smwaReject = (callbackId: string, error: string) => {
    const cb = pendingCallbacks.get(callbackId);
    if (cb) {
      clearTimeout(cb.timer);
      pendingCallbacks.delete(callbackId);
      cb.reject(new Error(error));
    }
  };
}

function createCallback<T>(): { callbackId: string; promise: Promise<T> } {
  installGlobalHandlers();

  const callbackId = `smwa_${++callbackCounter}_${Date.now()}`;
  let resolve!: (value: T) => void;
  let reject!: (reason: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const timer = setTimeout(() => {
    pendingCallbacks.delete(callbackId);
    reject(new Error("SMWA bridge timeout"));
  }, TIMEOUT_MS);

  pendingCallbacks.set(callbackId, { resolve, reject, timer });

  return { callbackId, promise };
}

export function isSMWABridgeAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.SolanaBridge &&
    typeof window.SolanaBridge.isAvailable === "function" &&
    window.SolanaBridge.isAvailable()
  );
}

export function smwaGetPublicKey(): string | null {
  if (!isSMWABridgeAvailable()) return null;
  return window.SolanaBridge!.getPublicKey();
}

export async function smwaConnect(): Promise<{ publicKey: string }> {
  if (!isSMWABridgeAvailable()) throw new Error("SMWA bridge not available");
  const { callbackId, promise } = createCallback<{ publicKey: string }>();
  window.SolanaBridge!.connect(callbackId);
  return promise;
}

export async function smwaDisconnect(): Promise<void> {
  if (!isSMWABridgeAvailable()) throw new Error("SMWA bridge not available");
  const { callbackId, promise } = createCallback<void>();
  window.SolanaBridge!.disconnect(callbackId);
  return promise;
}

export async function smwaSignTransactions(base64Txs: string[]): Promise<string[]> {
  if (!isSMWABridgeAvailable()) throw new Error("SMWA bridge not available");
  const { callbackId, promise } = createCallback<string[]>();
  window.SolanaBridge!.signTransactions(callbackId, JSON.stringify(base64Txs));
  return promise;
}

export async function smwaSignAndSendTransactions(base64Txs: string[]): Promise<string[]> {
  if (!isSMWABridgeAvailable()) throw new Error("SMWA bridge not available");
  const { callbackId, promise } = createCallback<string[]>();
  window.SolanaBridge!.signAndSendTransactions(callbackId, JSON.stringify(base64Txs));
  return promise;
}
