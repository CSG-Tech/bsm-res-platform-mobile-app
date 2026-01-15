
export default {
  expo: {
    name: 'BassamBooking',
    slug: 'bassambooking',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'bassambooking',
    userInterfaceStyle: 'light',

    assetBundlePatterns: ['**/*'],
    icon: './assets/icon.png',
    plugins: [
      'expo-router',
      'expo-splash-screen',
      [
        'expo-notifications',
        {
          "icon": './assets/icon-logo.png',
        }
      ],
    ],
    android: {
      useNextNotificationsApi: true,
      package: "com.bassamshippingsa.bassambooking",
      "usesCleartextTraffic": true,
      "networkSecurityConfig": "./network_security_config.xml",
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#FFFFFF',
      },
      permissions: ['android.permission.DETECT_SCREEN_CAPTURE', 'POST_NOTIFICATIONS'],
      package: 'com.bassamshippingsa.bassambooking',
      googleServicesFile: './google-services.json',
    },
    ios: {
      icon: './assets/icon.png',
      supportsTablet: true,
      infoPlist: {
        // UIBackgroundModes: ['fetch', 'remote-notification'],
        NSUserNotificationUsageDescription: "Would you like to receive notifications from Bassam Booking App? This includes booking updates and promotional offers.",
        ITSAppUsesNonExemptEncryption: false,
      },
      supportsTablet: true,
      bundleIdentifier: "com.bassamshippingsa.bassambooking",
      usesAppleSignIn: true
    },
    extra: {
      API_BASE_URL_DEV: "https://csg-server-apps.maxapex.net:7000/api",
      API_BASE_URL_PROD: "https://csg-server-apps.maxapex.net:7000/api",
      EXPO_PUBLIC_API_URL: "https://csg-server-apps.maxapex.net:7000",
      eas:{
        projectId: '0410ea4c-db3f-4cad-9ebf-37cde58af68b'
      }
    },
  },
};
