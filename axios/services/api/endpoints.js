export const ENDPOINTS = {
  AUTH: {
    GUEST: '/auth/guest',
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
  },
  DEGREES: {
    GET_BY_TRIP: (tripserial, degreeName) => 
      `/degrees/getAllDegrees/${tripserial}?degreeName=${degreeName}`,
  },
  TRIPS: {
    BY_LINE: (fromDate, toDate, lineCode, classId) =>
      `/trips/getTripsByDateAndPort/${fromDate}/${toDate}/${lineCode}/${classId}`,
    SUMMARY: (tripSerial) => `/trips/${tripSerial}`, 
  },
  PORTS: {
    GET_FROM_PORTS: '/ports/get_from_ports/SA',
    GET_TO_PORTS: (fromPort) => `/ports/get_to_ports/${fromPort}`,
  },
  CLASSES: {
    GET_ALL: `/classes/getAll`,
  },
  CONTROL: {
    GET_NAT: (natName) =>  `/control/getAllNats?natName=${natName}`,
    GET_VISA: (visaTypeName) => `/control/getAllVisas?visaTypeName=${visaTypeName}`,
  },
  PRICES: {
    GET_BY_TRIP: (tripserial, branch) => `/price-lists/prices/${tripserial}?branch=${branch}`,
  },
  RESERVATIONS: {
    CREATE: '/reservations', 
  },
  USER: {
    GET_INFO: '/users/me',
    UPDATE: '/users/update',
  },
};