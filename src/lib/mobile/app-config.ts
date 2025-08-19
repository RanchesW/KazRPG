// ===== src/lib/mobile/app-config.ts =====
interface AppConfig {
  apiUrl: string
  websocketUrl: string
  version: string
  features: {
    push_notifications: boolean
    offline_mode: boolean
    biometric_auth: boolean
    dark_theme: boolean
  }
  social: {
    telegram: string
    instagram: string
    discord: string
  }
  support: {
    email: string
    phone: string
    chat_url: string
  }
}

export function generateMobileAppConfig(): AppConfig {
  return {
    apiUrl: env.APP_URL + '/api',
    websocketUrl: env.APP_URL.replace('http', 'ws') + '/ws',
    version: '1.0.0',
    features: {
      push_notifications: true,
      offline_mode: true,
      biometric_auth: true,
      dark_theme: true,
    },
    social: {
      telegram: 'https://t.me/kazrpg',
      instagram: 'https://instagram.com/kazrpg',
      discord: 'https://discord.gg/kazrpg',
    },
    support: {
      email: 'support@kazrpg.kz',
      phone: '+7 777 123 45 67',
      chat_url: env.APP_URL + '/support/chat',
    },
  }
}