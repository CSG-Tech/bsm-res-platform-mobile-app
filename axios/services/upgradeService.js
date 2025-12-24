import api from './api/axiosConfig';
import { ENDPOINTS } from './api/endpoints';

// 🔸 Get Available Upgrade Degrees
export const getAvailableUpgradeDegrees = async (ticketId) => {
  console.log(
    '➡️ getAvailableUpgradeDegrees URL:',
    ENDPOINTS.UPGRADE.GET_OPTIONS(ticketId),
  );

  const res = await api.get(
    ENDPOINTS.UPGRADE.GET_OPTIONS(ticketId),
  );

  console.log('Upgrade Degrees Response:', res.data.data);
  return res.data;
};

// 🔸 Upgrade Ticket Degree
export const upgradeTicketDegree = async (payload) => {
  console.log(
    '➡️ upgradeTicketDegree URL:',
    ENDPOINTS.UPGRADE.UPGRADE_TICKET,
  );
  console.log('Upgrade Payload:', payload);

  const res = await api.post(
    ENDPOINTS.UPGRADE.UPGRADE_TICKET,
    payload,
  );

  console.log('Upgrade Response:', res.data.data);
  return res.data;
};
