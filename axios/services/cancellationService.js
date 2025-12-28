import api from './api/axiosConfig';
import { ENDPOINTS } from './api/endpoints';

// 🔸 Get Cancellation Policies
export const getCancellationPolicies = async (tripSerial) => {
  console.log(
    '➡️ getCancellationPolicies URL:',
    ENDPOINTS.CANCELLATION.GET_POLICIES(tripSerial),
  );

  const res = await api.get(
    ENDPOINTS.CANCELLATION.GET_POLICIES(tripSerial),
  );

  console.log('Cancellation Policies Response:', res.data.data);
  return res.data;
};

// 🔸 Cancel Reservation
export const cancelReservation = async (payload) => {
  console.log(
    '➡️ cancelReservation URL:',
    ENDPOINTS.CANCELLATION.CANCEL_RESERVATION,
  );
  console.log('Cancel Reservation Payload:', payload);

  const res = await api.post(
    ENDPOINTS.CANCELLATION.CANCEL_RESERVATION,
    payload,
  );

  console.log('Cancel Reservation Response:', res.data.data);
  return res.data;
};

// 🔸 Cancel Tickets
export const cancelTickets = async (payload) => {
  console.log(
    '➡️ cancelTickets URL:',
    ENDPOINTS.CANCELLATION.CANCEL_TICKETS,
  );
  console.log('Cancel Tickets Payload:', payload);

  const res = await api.post(
    ENDPOINTS.CANCELLATION.CANCEL_TICKETS,
    payload,
  );

  console.log('Cancel Tickets Response:', res.data.data);
  return res.data;
};
