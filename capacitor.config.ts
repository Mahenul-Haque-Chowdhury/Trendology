import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.aamardokan.app',
  appName: 'AamarDokan',
  webDir: 'out',
  server: {
    // Load from your live site in production
    url: 'https://aamar-dokan.vercel.app/',
    cleartext: false,
    allowNavigation: ['aamar-dokan.vercel.app', '*.supabase.co']
  },
  ios: {
    contentInset: 'always'
  }
}

export default config
