import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tradejournal.pro',
  appName: 'Trade Journal Pro',
  server: {
    url: 'https://nyun-crypto.vercel.app',
    cleartext: false
  }
};

export default config;