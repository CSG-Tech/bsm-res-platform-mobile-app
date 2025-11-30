import 'dotenv/config';
console.log(`[app.config.js] API_BASE_URL_DEV is: ${process.env.API_BASE_URL_DEV}`);

export default {
  expo: {
    name: 'bassam-shipping-frontend',
    slug: 'bassam-shipping-frontend',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'bassamshipping',
    userInterfaceStyle: 'light',

    assetBundlePatterns: ['**/*'],

    ios: {
      supportsTablet: true,
    },

    android: {
      permissions: ['android.permission.DETECT_SCREEN_CAPTURE', 'INTERNET'],
      package: 'com.zeina.hass.bassamshippingfrontend',
    },

    plugins: [
      'expo-router',
      'expo-asset',
      'expo-splash-screen',
    ],
    "extra": {
      "API_BASE_URL_DEV": process.env.API_BASE_URL_DEV,
      "API_BASE_URL_PROD": process.env.API_BASE_URL_PROD
    }
  },
};
