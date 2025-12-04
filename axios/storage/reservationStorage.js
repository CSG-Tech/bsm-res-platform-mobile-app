import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_RESERVATION_KEY = 'pendingReservationId';

export const savePendingReservation = async (reservationId) => {
  await AsyncStorage.setItem(PENDING_RESERVATION_KEY, String(reservationId));
};

export const getPendingReservation = async () => {
  return await AsyncStorage.getItem(PENDING_RESERVATION_KEY);
};

export const clearPendingReservation = async () => {
  await AsyncStorage.removeItem(PENDING_RESERVATION_KEY);
};