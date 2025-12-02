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

// 🔸 Update Reservation Passengers
export const updateReservationPassengers = async (reservationId, createReservationDto) => {
  console.log('➡️ updateReservationPassengers URL:', ENDPOINTS.RESERVATIONS.UPDATE_PASSENGERS(reservationId));
    const deviceId = await getOrCreateDeviceId();

  // Prepare payload with device ID
  const payload = {
    ...createReservationDto,
    deviceId,
    branchCode: createReservationDto.branchCode ?? 1, // Default to 1 if not provided
  };

  const res = await api.put(ENDPOINTS.RESERVATIONS.UPDATE_PASSENGERS(reservationId), payload);
  console.log('Update Passengers Response:', res.data);
  return res.data;
};

// 🔸 Get Reservation Status
export const getReservationStatus = async (reservationId) => {
  console.log('➡️ getReservationStatus URL:', ENDPOINTS.PAYMENTS.GET_RESERVATION_STATUS(reservationId));
  const res = await api.get(ENDPOINTS.PAYMENTS.GET_RESERVATION_STATUS(reservationId));
  console.log('Reservation Status Response:', res.data);
  return res.data;
};

// 🔸 Cancel Processing Reservation
export const cancelProcessingReservation = async (reservationId) => {
  console.log('➡️ cancelProcessingReservation URL:', ENDPOINTS.PAYMENTS.CANCEL_PROCESSING(reservationId));
  const res = await api.post(ENDPOINTS.PAYMENTS.CANCEL_PROCESSING(reservationId));
  console.log('Cancel Processing Response:', res.data);
  return res.data;
};

// 🔸 Expire Reservation
export const expireReservation = async (reservationId) => {
  console.log('➡️ expireReservation URL:', ENDPOINTS.RESERVATIONS.EXPIRE(reservationId));
  const res = await api.post(ENDPOINTS.RESERVATIONS.EXPIRE(reservationId));
  console.log('Expire Reservation Response:', res.data);
  return res.data;
};
