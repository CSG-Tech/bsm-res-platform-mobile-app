// ticketService.js
import api from './api/axiosConfig';
import { ENDPOINTS } from './api/endpoints';
import { getOrCreateDeviceId } from '../storage/deviceStorage.js';

// 🔸 Get Trip Summary
export const getTripSummary = async (tripSerial) => {
  console.log('➡️ getTripSummary URL:', ENDPOINTS.TRIPS.SUMMARY(tripSerial));

  const res = await api.get(ENDPOINTS.TRIPS.SUMMARY(tripSerial));
  console.log('Trip Summary Response:', res.data);
  return res.data;
};

// 🔸 Create Reservation
export const createReservation = async (reservationData) => {
  console.log('➡️ createReservation URL:', ENDPOINTS.RESERVATIONS.CREATE);

  // Get device ID
  const deviceId = await getOrCreateDeviceId();

  // Prepare payload with device ID
  const payload = {
    ...reservationData,
    deviceId,
    branchCode: reservationData.branchCode ?? 1, // Default to 1 if not provided
  };

  console.log('Reservation Payload:', payload);

  const res = await api.post(ENDPOINTS.RESERVATIONS.CREATE, payload);
  console.log('Reservation Response:', res.data);
  return res.data;
};