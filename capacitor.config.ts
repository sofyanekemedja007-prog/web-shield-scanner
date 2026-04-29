import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.scanvirusdz',
  appName: 'ScanVirusDZ',
  webDir: 'dist',
  server: {
    url: 'https://67e9f9ef-c2d1-4401-9eb9-70015542aa4e.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
