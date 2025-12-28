// payment service
import api from './api/axiosConfig';
import { ENDPOINTS } from './api/endpoints';

// 🔸 Create Payment Token
export const createPaymentToken = async (reservationId, paymentMethod = 'creditcard') => {
  console.log('➡️ createPaymentToken URL:', ENDPOINTS.PAYMENTS.CREATE_TOKEN);
  const res = await api.post(ENDPOINTS.PAYMENTS.CREATE_TOKEN, { reservationId, paymentMethod });
  console.log('Create Payment Token Response:', res.data);
  return res.data;
};

// 🔸 Get Payment Data by Token
export const getPaymentDataByToken = async (token) => {
  console.log('➡️ getPaymentDataByToken URL:', ENDPOINTS.PAYMENTS.GET_PAYMENT_DATA(token));
  const res = await api.get(ENDPOINTS.PAYMENTS.GET_PAYMENT_DATA(token));
  console.log('Get Payment Data Response:', res.data);
  return res.data;
};

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