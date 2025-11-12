import axios from 'axios';
import Constants from 'expo-constants';
import { attachAuthInterceptors } from './authInterceptor';
const { API_BASE_URL_DEV, API_BASE_URL_PROD } = Constants.expoConfig.extra;

const baseURL = __DEV__ ? API_BASE_URL_DEV : API_BASE_URL_PROD;

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// attach interceptors (handles refresh)
attachAuthInterceptors(api);

export default api;
