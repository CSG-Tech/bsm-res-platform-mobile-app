
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
    ],

    extra: {
      API_BASE_URL_DEV: process.env.API_BASE_URL_DEV,
      API_BASE_URL_PROD: process.env.API_BASE_URL_PROD,
    },
  },
};
