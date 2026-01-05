import api from './api/axiosConfig';
import { ENDPOINTS } from './api/endpoints';

// 🔸 Send OTP
export const sendOTP = async ({
  reservationId,
  purpose,
  email,
  passengerName,
}) => {
  console.log('➡️ sendOTP URL:', ENDPOINTS.OTP.GENERATE);
  console.log('Send OTP Payload:', {
    reservationId,
    purpose,
    email,
    passengerName,
  });

  const res = await api.post(ENDPOINTS.OTP.GENERATE, {
    reservationId,
    purpose,
    email,
    passengerName,
  });

  console.log('Send OTP Response:', res.data);
  return res.data;
};

// 🔸 Resend OTP
export const resendOTP = async ({
  reservationId,
  purpose,
  email,
  passengerName,
}) => {
  console.log('➡️ resendOTP URL:', ENDPOINTS.OTP.RESEND);
  console.log('Resend OTP Payload:', {
    reservationId,
    purpose,
    email,
    passengerName,
  });

  const res = await api.post(ENDPOINTS.OTP.RESEND, {
    reservationId,
    purpose,
    email,
    passengerName,
  });

  console.log('Resend OTP Response:', res.data);
  return res.data;
};

// 🔸 Verify OTP
export const verifyOTP = async ({
  reservationId,
  otpCode,
  purpose,
}) => {
  console.log('➡️ verifyOTP URL:', ENDPOINTS.OTP.VERIFY);
  console.log('Verify OTP Payload:', {
    reservationId,
    otpCode,
    purpose,
  });

  const res = await api.post(ENDPOINTS.OTP.VERIFY, {
    reservationId,
    otpCode,
    purpose,
  });

  console.log('Verify OTP Response:', res.data);
  return res.data;
};

// 🔸 Get reservation email
export const getReservationEmail = async (reservationId) => {
  console.log('➡️ getReservationEmail URL:', ENDPOINTS.OTP.GET_EMAIL);
  console.log('Get Email Payload:', { reservationId });
  
  const res = await api.post(ENDPOINTS.OTP.GET_EMAIL, {
    reservationId,
  });
  
  console.log('Reservation Email Response:', res.data);
  return res.data; // { success: true, email: "user@example.com", hasEmail: true }
};
