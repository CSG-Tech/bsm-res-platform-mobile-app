
export default {
  expo: {
    name: 'NewBassamShipping',
    slug: 'NewBassamShipping',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'bassamshipping',
    userInterfaceStyle: 'light',

    assetBundlePatterns: ['**/*'],

    ios: {
      supportsTablet: true,
    },

    android: {
      permissions: ['android.permission.DETECT_SCREEN_CAPTURE'],
      package: 'com.zeina.hass.bassamshippingfrontend',
    },
    plugins: [
      'expo-router',
      'expo-splash-screen',
      [
        'expo-notifications',
        {
          "icon": './assets/Logo.png',
          "color": "#000000"
        }
      ],
    ],
    android: {
      useNextNotificationsApi: true,
      package: "com.yourcompany.bassamshipping"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.bassamshipping",
      usesAppleSignIn: true
    },
    extra: {
      API_BASE_URL_DEV: process.env.API_BASE_URL_DEV,
      API_BASE_URL_PROD: process.env.API_BASE_URL_PROD,
      eas:{
        projectId: '0410ea4c-db3f-4cad-9ebf-37cde58af68b'
      }
    },
  },
};
