"use client";

interface IWalletNotification {
  publicKey?: string;
  shortAddress?: string;
  walletName?: string;
  metadata?: {
    name: string;
    url: string;
    icon: string;
    supportedTransactionVersions?: any;
  };
}

// Simple notification component matching Jupiter official docs
const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  console.log(`[${type.toUpperCase()}] ${message}`);

  // Simple visual feedback
  if (typeof window !== 'undefined') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }
};

export const WalletNotification = {
  onConnect: ({ shortAddress, walletName }: IWalletNotification) => {
    showNotification(`Connected to ${walletName} (${shortAddress})`, 'success');
  },
  onConnecting: ({ walletName }: IWalletNotification) => {
    showNotification(`Connecting to ${walletName}...`, 'info');
  },
  onDisconnect: ({ walletName }: IWalletNotification) => {
    showNotification(`Disconnected from ${walletName}`, 'info');
  },
  onError: ({ walletName }: IWalletNotification) => {
    showNotification(`Failed to connect to ${walletName}`, 'error');
  },
  onNotInstalled: ({ walletName }: IWalletNotification) => {
    showNotification(`${walletName} is not installed`, 'error');
  },
};

export default WalletNotification;
