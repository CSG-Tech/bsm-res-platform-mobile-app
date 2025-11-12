export const ENDPOINTS = {
  AUTH: {
    GUEST: '/auth/guest',
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
  },
  DEGREES: {
    GET_BY_COUNTRY: (degreeName) => `/degrees/getAllDegrees/SA?degreeName=${degreeName}`,
  },
  TRIPS: {
    BY_LINE: (fromDate, toDate, lineCode) =>
      `/trips/getTripsByDateAndPort/${fromDate}/${toDate}/${lineCode}`,
  },
  PORTS: {
    GET_FROM_PORTS: '/ports/get_from_ports/SA',
    GET_TO_PORTS: (fromPort) => `/ports/get_to_ports/${fromPort}`,
  }
};
