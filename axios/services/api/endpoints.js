export const ENDPOINTS = {
  AUTH: {
    GUEST: '/auth/guest',
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
  },
  DEGREES: {
    GET_BY_TRIP: (tripserial, degreeName) =>
      `/degrees/getAllDegrees/${tripserial}?degreeName=${degreeName || ''}`,
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
    GET_ALL: '/classes/getAll',
  },
  CONTROL: {
    GET_NAT: (natName) => `/control/getAllNats?natName=${natName || ''}`,
    GET_VISA: (visaTypeName) => `/control/getAllVisas?visaTypeName=${visaTypeName || ''}`,
  },
  PRICES: {
    GET_BY_TRIP: (tripserial, branch) =>
      `/price-lists/prices/${tripserial}?branch=${branch || ''}`,
  },
  USER: {
    GET_INFO: '/users/me',
    UPDATE: '/users/update',
    DEVICE_TOKEN: '/users/save-device-token',
  },
  PAYMENTS: {
    INITIATE: '/payments/initiate',                  
    MOYASAR_CALLBACK: '/payments/moyasar/callback', 
    VERIFY: (paymentId) => `/payments/verify/${paymentId}`, 
    CAPTURE: (reservationId) => `/payments/capture/${reservationId}`,
    GET_RESERVATION_STATUS: (reservationId) => `/payments/reservation/${reservationId}/status`,
    CANCEL_PROCESSING: (reservationId) => `/payments/reservation/${reservationId}/cancel-processing`,
    CREATE_TOKEN: '/payments/token/create',
    GET_PAYMENT_DATA: (token) => `/payments/token/${token}`,
  },
  RESERVATIONS: {
    CREATE: '/reservations',
    UPDATE_PASSENGERS: (reservationId) => `/reservations/${reservationId}/passengers`,
    EXPIRE: (reservationId) => `/reservations/${reservationId}/expire`,
    GET_DETAILS: (reservationId) => `/reservations/${reservationId}`,
    FIND_RESERVATION: '/reservations/findReservation',
  },
};
