import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'deviceId';

export const getOrCreateDeviceId = async () => {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  console.log('Retrieved device ID:', deviceId);
  if (!deviceId) {
    const nativeId =
      Platform.OS === 'android'
        ? Application.androidId
        : Device.osInternalBuildId || (await Crypto.randomUUID());

    deviceId = nativeId || (await Crypto.randomUUID());
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};
