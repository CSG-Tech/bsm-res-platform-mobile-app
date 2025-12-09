// services/userService.js
import api from './api/axiosConfig';
import { ENDPOINTS } from './api/endpoints';

// 🔸 Get User Info (email, phone)
export const getUserInfo = async () => {
  console.log('➡️ getUserInfo URL:', ENDPOINTS.USER.GET_INFO);

  const res = await api.get(ENDPOINTS.USER.GET_INFO);
  console.log('User Info Response:', res.data);
  return res.data;
};

// 🔸 Update User (email, phone, password)
export const updateUser = async (updates) => {
  // Skip if no actual updates
  if (!updates.email && !updates.phone && !updates.password) {
    console.log('No updates to send');
    return null;
  }

  console.log('➡️ updateUser URL:', ENDPOINTS.USER.UPDATE);
  const res = await api.patch(ENDPOINTS.USER.UPDATE, updates);
  return res.data;
};

// 🔸 Save Device Token for Push Notifications
export const saveDeviceToken = async (deviceId, deviceToken) => {
  console.log('➡️ saveDeviceToken URL:', ENDPOINTS.USER.DEVICE_TOKEN);
  const res = await api.patch(ENDPOINTS.USER.DEVICE_TOKEN, {
  deviceId,
  deviceToken,
  });
  return res.data;
}
