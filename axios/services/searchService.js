import api from './api/axiosConfig';
import { ENDPOINTS } from './api/endpoints';

// 🔸 Get From Ports
export const getFromPorts = async () => {
  const res = await api.get(ENDPOINTS.PORTS.GET_FROM_PORTS);
  console.log('From Ports Response:', res.data.data);
  return res.data.data;
};

// 🔸 Get To Ports
export const getToPorts = async (fromPort) => {
  console.log('➡️ getToPorts URL:', ENDPOINTS.PORTS.GET_TO_PORTS(fromPort));

  const res = await api.get(ENDPOINTS.PORTS.GET_TO_PORTS(fromPort));
  console.log('To Ports Response:', res.data.data);
  return res.data;
};

export const getAllClasses = async (className) => {
  if (className === undefined) {
    console.log('➡️ getAllClasses URL:', ENDPOINTS.CLASSES.GET_ALL);

    const res = await api.get(ENDPOINTS.CLASSES.GET_ALL);
    console.log('Classes Response:', res.data.data);
    return res.data;
  } 
  else {
    console.log('➡️ getAllClasses URL:', `${ENDPOINTS.CLASSES.GET_ALL}?name=${className}`);

    const res = await api.get(`${ENDPOINTS.CLASSES.GET_ALL}?name=${className}`);
    console.log('Classes Response:', res.data.data);
    return res.data;
  }
};

export const getTripsByDateAndLine = async (fromDate, toDate, lineCode, classId) => {
  console.log('➡️ trips URL:', ENDPOINTS.TRIPS.BY_LINE(fromDate, toDate, lineCode, classId)
  );

  const res = await api.get(ENDPOINTS.TRIPS.BY_LINE(fromDate, toDate, lineCode, classId));
  console.log('Trips Response:', res.data.data);
  return res.data;
};