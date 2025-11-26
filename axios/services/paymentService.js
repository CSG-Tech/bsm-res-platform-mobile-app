import api from './api/axiosConfig';
import { ENDPOINTS } from './api/endpoints';

// 🔸 Initiate Payment
export const initiatePayment = async (reservationId, paymentMethod = 'creditcard') => {
  console.log('➡️ initiatePayment URL:', ENDPOINTS.PAYMENTS.INITIATE);
  const res = await api.post(ENDPOINTS.PAYMENTS.INITIATE, { reservationId, paymentMethod });
  console.log('Initiate Payment Response:', res.data);
  return res.data;
};

// 🔸 Verify Payment Status
export const verifyPayment = async (paymentId) => {
  console.log('➡️ verifyPayment URL:', ENDPOINTS.PAYMENTS.VERIFY(paymentId));
  const res = await api.get(ENDPOINTS.PAYMENTS.VERIFY(paymentId));
  console.log('Verify Payment Response:', res.data);
  return res.data;
};

// 🔸 Capture Authorized Payment
export const capturePayment = async (reservationId) => {
  console.log('➡️ capturePayment URL:', ENDPOINTS.PAYMENTS.CAPTURE(reservationId));
  const res = await api.post(ENDPOINTS.PAYMENTS.CAPTURE(reservationId));
  console.log('Capture Payment Response:', res.data);
  return res.data;
};

// 🔸 Handle Moyasar Callback (usually called server-side, but included for completeness)
export const moyasarCallback = async (payload) => {
  console.log('➡️ moyasarCallback URL:', ENDPOINTS.PAYMENTS.MOYASAR_CALLBACK);
  const res = await api.post(ENDPOINTS.PAYMENTS.MOYASAR_CALLBACK, payload);
  console.log('Moyasar Callback Response:', res.data);
  return res.data;
};
