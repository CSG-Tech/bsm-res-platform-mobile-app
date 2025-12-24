import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const saveTokens = async (tokens = {}) => {
  const { accessToken, refreshToken } = tokens.data;
  console.log('Preparing to save tokens');
  // Safely handle missing values
  const pairs = [];

  if (accessToken) pairs.push([ACCESS_KEY, accessToken]);
  if (refreshToken) pairs.push([REFRESH_KEY, refreshToken]);

  console.log('Saving tokens.');

  if (pairs.length > 0) {
    await AsyncStorage.multiSet(pairs);
  }
};

export const getTokens = async () => {
  const values = await AsyncStorage.multiGet([ACCESS_KEY, REFRESH_KEY]);
  const map = Object.fromEntries(values);
  return {
    accessToken: map[ACCESS_KEY],
    refreshToken: map[REFRESH_KEY],
  };
};

export const clearTokens = async () => {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
};
