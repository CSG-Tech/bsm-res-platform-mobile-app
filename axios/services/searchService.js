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

// 🔸 Get To Ports
export const getAllDegrees = async (degreeName) => {
  if(degreeName === undefined){
    console.log('➡️ getAllDegrees URL:', ENDPOINTS.DEGREES.GET_BY_COUNTRY(''));

    const res = await api.get(ENDPOINTS.DEGREES.GET_BY_COUNTRY(''));
    console.log('Degrees Response:', res.data.data);
    return res.data;
  
  }
  else{
    console.log('➡️ getAllDegrees URL:', ENDPOINTS.DEGREES.GET_BY_COUNTRY(degreeName));

    const res = await api.get(ENDPOINTS.DEGREES.GET_BY_COUNTRY(degreeName));
    console.log('Degrees Response:', res.data.data);
    return res.data;  
  }
};

export const getTripsByDateAndLine = async (fromDate, toDate, lineCode) => {
  console.log('➡️ trips URL:', ENDPOINTS.TRIPS.BY_LINE(fromDate, toDate, lineCode));

  const res = await api.get(ENDPOINTS.TRIPS.BY_LINE(fromDate, toDate, lineCode));
  console.log('Trips Response:', res.data.data);
  return res.data;
};