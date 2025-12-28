import { Stack } from 'expo-router';

import { configureCalendar, setCalendarLanguage } from '../config/calendarConfig';
import i18n from './i18n';

configureCalendar();
setCalendarLanguage(i18n.language);
i18n.on('languageChanged', (lng) => {
  setCalendarLanguage(lng);
});

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="search-results" options={{ headerShown: false }} />
      <Stack.Screen name="vessel-details" options={{ headerShown: false }} />
      <Stack.Screen name="reservation" options={{ headerShown: false }} />
      <Stack.Screen name="summary" options={{ headerShown: false }} />
      <Stack.Screen name="payment" options={{ headerShown: false }} />
      <Stack.Screen name="eticket" options={{ headerShown: false }} />
      <Stack.Screen name="payment-webview" options={{ headerShown: false }} />
      <Stack.Screen name="payment-result" options={{ headerShown: false }} />
      <Stack.Screen name="confirmation" options={{ headerShown: false }} />
      <Stack.Screen name="failed-booking" options={{ headerShown: false }} />
    </Stack>
  );
}