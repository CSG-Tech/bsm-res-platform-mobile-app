// services/otpService.js
import api from './api/axiosConfig';
import { ENDPOINTS } from './api/endpoints';

// Send OTP for any action
export const sendOTP = async (action, metadata) => {
  // action: 'cancel_reservation', 'modify_reservation', 'search_reservation'
  // metadata: { reservationId, email, phone, etc }
  const res = await api.post(ENDPOINTS.OTP.SEND, { 
    action, 
    ...metadata 
  });
  return res.data; // { sessionToken, expiresAt, sentTo: 'email/sms' }
};

// Verify OTP
export const verifyOTP = async (sessionToken, otpCode, action) => {
  const res = await api.post(ENDPOINTS.OTP.VERIFY, { 
    sessionToken, 
    otpCode,
    action 
  });
  return res.data; // { verified: true, ... }
};

// Resend OTP
export const resendOTP = async (sessionToken) => {
  const res = await api.post(ENDPOINTS.OTP.RESEND, { sessionToken });
  return res.data;
};