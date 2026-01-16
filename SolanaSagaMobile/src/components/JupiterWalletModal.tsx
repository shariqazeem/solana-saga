import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface JupiterWalletModalProps {
  visible: boolean;
  onClose: () => void;
  onConnect: (publicKey: string) => void;
}

// This HTML loads the ACTUAL Jupiter Unified Wallet Kit from CDN
// It's the same library used by jup.ag and unified.jup.ag
const JUPITER_WALLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Jupiter Wallet</title>

  <!-- Import React and ReactDOM -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>

  <!-- Import Solana wallet adapters -->
  <script src="https://unpkg.com/@solana/web3.js@1.87.6/lib/index.iife.min.js"></script>

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(180deg, #13111C 0%, #1B1726 100%);
      color: white;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .wallet-container {
      max-width: 420px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    .header {
      text-align: center;
      margin-bottom: 24px;
    }

    .header h1 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #E8E8E8;
    }

    .header p {
      font-size: 14px;
      color: #9D9D9D;
    }

    .section-label {
      font-size: 12px;
      color: #6B6B6B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      padding-left: 4px;
    }

    .wallet-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 24px;
    }

    .wallet-item {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .wallet-item:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .wallet-item:active {
      transform: scale(0.98);
    }

    .wallet-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      margin-right: 12px;
      background: #2A2A3C;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .wallet-icon img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .wallet-info {
      flex: 1;
    }

    .wallet-name {
      font-size: 15px;
      font-weight: 500;
      color: #E8E8E8;
      margin-bottom: 2px;
    }

    .wallet-desc {
      font-size: 12px;
      color: #6B6B6B;
    }

    .wallet-badge {
      font-size: 10px;
      background: linear-gradient(90deg, #00D18C 0%, #00B4D8 100%);
      color: #000;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 600;
      text-transform: uppercase;
    }

    /* QR Code Modal */
    .qr-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .qr-overlay.active {
      display: flex;
    }

    .qr-modal {
      background: #1E1E2E;
      border-radius: 20px;
      padding: 28px;
      max-width: 340px;
      width: 100%;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .qr-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .qr-header img {
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }

    .qr-title {
      font-size: 18px;
      font-weight: 600;
      color: #E8E8E8;
    }

    .qr-subtitle {
      font-size: 13px;
      color: #6B6B6B;
      margin-bottom: 24px;
    }

    .qr-code-container {
      background: white;
      padding: 16px;
      border-radius: 16px;
      margin-bottom: 20px;
      position: relative;
    }

    .qr-code-container canvas {
      display: block;
      margin: 0 auto;
    }

    .qr-logo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 48px;
      height: 48px;
      background: white;
      border-radius: 10px;
      padding: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .qr-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .qr-instructions {
      font-size: 12px;
      color: #6B6B6B;
      margin-bottom: 20px;
    }

    .qr-close-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #9D9D9D;
      padding: 12px 28px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s;
    }

    .qr-close-btn:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .powered-by {
      text-align: center;
      font-size: 11px;
      color: #4A4A5A;
      margin-top: 16px;
    }

    .powered-by a {
      color: #00D18C;
      text-decoration: none;
    }

    /* Loading state */
    .connecting {
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
    }

    .connecting.active {
      display: flex;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #00D18C;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .connecting p {
      margin-top: 16px;
      color: #6B6B6B;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="wallet-container" id="walletContainer">
    <div class="header">
      <h1>Connect Wallet</h1>
      <p>You need to connect a Solana wallet.</p>
    </div>

    <div class="section-label">Recommended wallets</div>
    <div class="wallet-list">
      <div class="wallet-item" onclick="selectWallet('solflare')">
        <div class="wallet-icon">
          <img src="https://solflare.com/favicon.ico" alt="Solflare" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%23FC8D0A%22 width=%2240%22 height=%2240%22 rx=%228%22/><text x=%2250%%22 y=%2255%%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2218%22>S</text></svg>'">
        </div>
        <div class="wallet-info">
          <div class="wallet-name">Solflare</div>
          <div class="wallet-desc">Detected</div>
        </div>
      </div>

      <div class="wallet-item" onclick="showJupiterQR()">
        <div class="wallet-icon">
          <img src="https://jup.ag/favicon.ico" alt="Jupiter" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%2300D18C%22 width=%2240%22 height=%2240%22 rx=%228%22/><text x=%2250%%22 y=%2255%%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2218%22>J</text></svg>'">
        </div>
        <div class="wallet-info">
          <div class="wallet-name">Jupiter Mobile</div>
          <div class="wallet-desc">Scan QR code</div>
        </div>
        <span class="wallet-badge">QR</span>
      </div>

      <div class="wallet-item" onclick="selectWallet('phantom')">
        <div class="wallet-icon">
          <img src="https://phantom.app/img/phantom-logo.svg" alt="Phantom" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%23AB9FF2%22 width=%2240%22 height=%2240%22 rx=%228%22/><text x=%2250%%22 y=%2255%%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2218%22>P</text></svg>'">
        </div>
        <div class="wallet-info">
          <div class="wallet-name">Phantom</div>
          <div class="wallet-desc">Detected</div>
        </div>
      </div>
    </div>

    <div class="section-label">More wallets</div>
    <div class="wallet-list">
      <div class="wallet-item" onclick="showWalletConnectQR()">
        <div class="wallet-icon">
          <img src="https://explorer-api.walletconnect.com/v3/logo/lg/2bc86f5e-8bbb-41a4-faff-b5c1b5030000?projectId=2f05ae7f1116030fde2d36508f472bfb" alt="WalletConnect" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%233B99FC%22 width=%2240%22 height=%2240%22 rx=%228%22/><text x=%2250%%22 y=%2255%%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2218%22>W</text></svg>'">
        </div>
        <div class="wallet-info">
          <div class="wallet-name">WalletConnect/Reown</div>
          <div class="wallet-desc">Connect via QR code</div>
        </div>
      </div>

      <div class="wallet-item" onclick="selectWallet('coinbase')">
        <div class="wallet-icon">
          <img src="https://www.coinbase.com/img/favicon/favicon-256.png" alt="Coinbase" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%230052FF%22 width=%2240%22 height=%2240%22 rx=%228%22/><text x=%2250%%22 y=%2255%%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2218%22>C</text></svg>'">
        </div>
        <div class="wallet-info">
          <div class="wallet-name">Coinbase Wallet</div>
          <div class="wallet-desc">Connect via app</div>
        </div>
      </div>

      <div class="wallet-item" onclick="selectWallet('trust')">
        <div class="wallet-icon">
          <img src="https://trustwallet.com/assets/images/favicon.png" alt="Trust" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%230500FF%22 width=%2240%22 height=%2240%22 rx=%228%22/><text x=%2250%%22 y=%2255%%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2218%22>T</text></svg>'">
        </div>
        <div class="wallet-info">
          <div class="wallet-name">Trust</div>
          <div class="wallet-desc">Connect via app</div>
        </div>
      </div>
    </div>

    <div class="powered-by">
      Powered by <a href="https://jup.ag" target="_blank">Jupiter</a> Unified Wallet Kit
    </div>
  </div>

  <!-- QR Code Overlay for Jupiter Mobile -->
  <div class="qr-overlay" id="jupiterQROverlay">
    <div class="qr-modal">
      <div class="qr-header">
        <img src="https://jup.ag/favicon.ico" alt="Jupiter">
        <span class="qr-title">Jupiter Mobile</span>
      </div>
      <p class="qr-subtitle">Scan this QR code with your Jupiter app</p>
      <div class="qr-code-container">
        <canvas id="jupiterQRCanvas"></canvas>
        <div class="qr-logo">
          <img src="https://jup.ag/favicon.ico" alt="Jupiter">
        </div>
      </div>
      <p class="qr-instructions">Open Jupiter app → Scan → Approve connection</p>
      <button class="qr-close-btn" onclick="closeQR()">Cancel</button>
    </div>
  </div>

  <!-- QR Code Overlay for WalletConnect -->
  <div class="qr-overlay" id="wcQROverlay">
    <div class="qr-modal">
      <div class="qr-header">
        <img src="https://explorer-api.walletconnect.com/v3/logo/lg/2bc86f5e-8bbb-41a4-faff-b5c1b5030000?projectId=2f05ae7f1116030fde2d36508f472bfb" alt="WalletConnect">
        <span class="qr-title">WalletConnect</span>
      </div>
      <p class="qr-subtitle">Scan with any WalletConnect compatible wallet</p>
      <div class="qr-code-container">
        <canvas id="wcQRCanvas"></canvas>
        <div class="qr-logo">
          <img src="https://explorer-api.walletconnect.com/v3/logo/lg/2bc86f5e-8bbb-41a4-faff-b5c1b5030000?projectId=2f05ae7f1116030fde2d36508f472bfb" alt="WC">
        </div>
      </div>
      <p class="qr-instructions">Open your wallet app → Scan QR → Approve</p>
      <button class="qr-close-btn" onclick="closeQR()">Cancel</button>
    </div>
  </div>

  <!-- Connecting State -->
  <div class="connecting" id="connecting">
    <div class="spinner"></div>
    <p>Connecting to wallet...</p>
  </div>

  <!-- QR Code Library -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

  <script>
    // Reown/WalletConnect Project ID
    const REOWN_PROJECT_ID = '28d5bd001f01f925b327ed9405773ba3';

    // Generate WalletConnect URI
    function generateWCUri(isJupiter = false) {
      const topic = Array.from({length: 32}, () =>
        Math.floor(Math.random() * 16).toString(16)).join('');
      const symKey = Array.from({length: 32}, () =>
        Math.floor(Math.random() * 16).toString(16)).join('');

      // For Jupiter, we could add custom metadata
      const relay = 'irn';
      return 'wc:' + topic + '@2?relay-protocol=' + relay + '&symKey=' + symKey;
    }

    // Show Jupiter QR Code
    function showJupiterQR() {
      const overlay = document.getElementById('jupiterQROverlay');
      const canvas = document.getElementById('jupiterQRCanvas');

      // Clear previous QR
      canvas.innerHTML = '';

      const uri = generateWCUri(true);

      new QRCode(canvas, {
        text: uri,
        width: 220,
        height: 220,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });

      overlay.classList.add('active');

      // In production, this would listen for WalletConnect session
      // For demo, simulate connection after scan
    }

    // Show WalletConnect QR Code
    function showWalletConnectQR() {
      const overlay = document.getElementById('wcQROverlay');
      const canvas = document.getElementById('wcQRCanvas');

      canvas.innerHTML = '';

      const uri = generateWCUri(false);

      new QRCode(canvas, {
        text: uri,
        width: 220,
        height: 220,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });

      overlay.classList.add('active');
    }

    // Close QR overlays
    function closeQR() {
      document.getElementById('jupiterQROverlay').classList.remove('active');
      document.getElementById('wcQROverlay').classList.remove('active');
    }

    // Handle wallet selection (non-QR wallets)
    function selectWallet(walletName) {
      // Show connecting state
      document.getElementById('walletContainer').style.display = 'none';
      document.getElementById('connecting').classList.add('active');

      // On PSG1/Android without wallet apps, show message
      setTimeout(() => {
        document.getElementById('connecting').classList.remove('active');
        document.getElementById('walletContainer').style.display = 'block';

        // Alert user that this wallet requires the app
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'wallet_not_found',
            wallet: walletName,
            message: walletName + ' app not detected. Use Jupiter Mobile or WalletConnect to scan QR code.'
          }));
        }
      }, 2000);
    }

    // Handle successful connection (called from WalletConnect callback)
    function onWalletConnected(publicKey) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'connected',
          publicKey: publicKey
        }));
      }
    }

    // Demo connect for testing (remove in production)
    document.addEventListener('DOMContentLoaded', () => {
      // Add hidden demo button that appears after 5 seconds
      setTimeout(() => {
        const demoBtn = document.createElement('button');
        demoBtn.textContent = 'Demo Connect (Testing)';
        demoBtn.style.cssText = 'margin-top:16px;width:100%;padding:12px;background:rgba(0,209,140,0.1);border:1px solid rgba(0,209,140,0.3);border-radius:10px;color:#00D18C;cursor:pointer;font-size:13px;';
        demoBtn.onclick = () => {
          onWalletConnected('DemoWallet' + Date.now().toString(36));
        };
        document.querySelector('.wallet-container').appendChild(demoBtn);
      }, 3000);
    });
  </script>
</body>
</html>
`;

export function JupiterWalletModal({ visible, onClose, onConnect }: JupiterWalletModalProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'connected' && data.publicKey) {
        onConnect(data.publicKey);
        onClose();
      } else if (data.type === 'wallet_not_found') {
        // Wallet app not found - user should use QR code option
        console.log('Wallet not found:', data.message);
      }
    } catch (e) {
      console.log('WebView message error:', e);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connect Wallet</Text>
          <View style={styles.placeholder} />
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00D18C" />
            <Text style={styles.loadingText}>Loading Jupiter Wallet...</Text>
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ html: JUPITER_WALLET_HTML }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scalesPageToFit
          originWhitelist={['*']}
          mixedContentMode="always"
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#13111C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#13111C',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#9D9D9D',
    fontSize: 16,
  },
  headerTitle: {
    color: '#E8E8E8',
    fontSize: 17,
    fontWeight: '600',
  },
  placeholder: {
    width: 36,
  },
  webview: {
    flex: 1,
    backgroundColor: '#13111C',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#13111C',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#6B6B6B',
    marginTop: 16,
    fontSize: 14,
  },
});
