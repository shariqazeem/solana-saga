// Polyfills required for WalletConnect in React Native
import 'react-native-get-random-values';

// Add global.Buffer if needed
import { Buffer } from 'buffer';
(global as any).Buffer = global.Buffer || Buffer;
