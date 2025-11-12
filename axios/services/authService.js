import { getOrCreateDeviceId } from '../storage/deviceStorage';
import { clearTokens, getTokens, saveTokens } from '../storage/tokenStorage';
import api from './api/axiosConfig';
import { ENDPOINTS } from './api/endpoints';

// 🔸 Guest session
export const createGuestSession = async () => {
  const deviceId = await getOrCreateDeviceId();
  const res = await api.post(ENDPOINTS.AUTH.GUEST, { deviceId });
  await saveTokens(res.data);
  return res.data;
};

// 🔸 Signup (new or guest upgrade)
export const signup = async (payload) => {
  const deviceId = await getOrCreateDeviceId();
  const res = await api.post(ENDPOINTS.AUTH.SIGNUP, { ...payload, deviceId });
  await saveTokens(res.data);
  return res.data;
};

// 🔸 Login
export const login = async (login, password) => {
  const deviceId = await getOrCreateDeviceId();
  const res = await api.post(ENDPOINTS.AUTH.LOGIN, { login, password, deviceId });
  await saveTokens(res.data);
  return res.data;
};

// 🔸 Refresh
export const refreshToken = async () => {
  const { refreshToken } = await getTokens();
  const deviceId = await getOrCreateDeviceId();
  if (!refreshToken) throw new Error('No refresh token found');
  const response = await api.post(ENDPOINTS.AUTH.REFRESH, { refreshToken, deviceId });
  await saveTokens(response.data);
  return response.data;
};

// 🔸 Logout (optional)
export const logout = async () => {
  await clearTokens();
  await createGuestSession(); // fallback immediately to guest
};
