import axios from 'axios';
import Constants from 'expo-constants';
import { clearTokens, getTokens, saveTokens } from '../../storage/tokenStorage';
import { ENDPOINTS } from './endpoints';
const { API_BASE_URL_DEV, API_BASE_URL_PROD } = Constants.expoConfig.extra;

const baseURL = __DEV__ ? API_BASE_URL_DEV : API_BASE_URL_PROD;

export const attachAuthInterceptors = (api) => {
  console.log(`📡 Axios initialized with baseURL: ${baseURL}`);
  // Add access token to all requests
  api.interceptors.request.use(async (config) => {
    const { accessToken } = await getTokens();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    console.log('➡️ API REQUEST:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL || baseURL}${config.url}`,
        headers: config.headers,
        data: config.data || null,
      });

    return config;
  });

  // Handle token expiration
  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { refreshToken } = await getTokens();
          if (!refreshToken) throw new Error('No refresh token available');

          // refresh manually
          const refreshResponse = await axios.post(`${baseURL}${ENDPOINTS.AUTH.REFRESH}`, {
            refreshToken,
            deviceId: 'mobile-app',
          });

          const newTokens = refreshResponse.data;
          await saveTokens(newTokens);

          // Update token for retry
          api.defaults.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

          return api(originalRequest);
        } catch (refreshErr) {
          console.error('Token refresh failed:', refreshErr);
          await clearTokens();
        }
      }

      return Promise.reject(error);
    }
  );
};
