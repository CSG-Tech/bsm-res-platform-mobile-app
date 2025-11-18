import api from './api/axiosConfig';
import { ENDPOINTS } from './api/endpoints';

// 🔸 Get All Degrees
export const getAllDegrees = async (tripserial, degreeName) => {
  if(degreeName === undefined){
    console.log('➡️ getAllDegrees URL:', ENDPOINTS.DEGREES.GET_BY_TRIP(tripserial,''));

    const res = await api.get(ENDPOINTS.DEGREES.GET_BY_TRIP(tripserial, ''));
    console.log('Degrees Response:', res.data.data);
    return res.data;
  
  }
  else{
    console.log('➡️ getAllDegrees URL:', ENDPOINTS.DEGREES.GET_BY_TRIP(tripserial, degreeName));

    const res = await api.get(ENDPOINTS.DEGREES.GET_BY_TRIP(tripserial, degreeName));
    console.log('Degrees Response:', res.data.data);
    return res.data;  
  }
};

// 🔸 Get All Visas
export const getAllVisas = async (visaTypeName) => {
  if(visaTypeName === undefined){
    console.log('➡️ getAllVisas URL:', ENDPOINTS.CONTROL.GET_VISA(''));

    const res = await api.get(ENDPOINTS.CONTROL.GET_VISA(''));
    console.log('Nationalities Response:', res.data.data);
    return res.data;
  
  }
  else{
    console.log('➡️ getAllVisas URL:', ENDPOINTS.CONTROL.GET_VISA(visaTypeName));

    const res = await api.get(ENDPOINTS.CONTROL.GET_VISA(visaTypeName));
    console.log('Visas Response:', res.data.data);
    return res.data;  
  }
};

// 🔸 Get All Nationalities
export const getAllNationalities = async (natName) => {
  if(natName === undefined){
    console.log('➡️ getAllNationalities URL:', ENDPOINTS.CONTROL.GET_NAT(''));

    const res = await api.get(ENDPOINTS.CONTROL.GET_NAT(''));
    console.log('Nationalities Response:', res.data.data);
    return res.data;
  
  }
  else{
    console.log('➡️ getAllNationalities URL:', ENDPOINTS.CONTROL.GET_NAT(natName));

    const res = await api.get(ENDPOINTS.CONTROL.GET_NAT(natName));
    console.log('Nationalities Response:', res.data.data);
    return res.data;  
  }
};
