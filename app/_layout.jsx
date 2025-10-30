import i18n from './i18n'; 
import { configureCalendar, setCalendarLanguage } from '../config/calendarConfig';
import { Stack } from 'expo-router';
import React from 'react';

configureCalendar();
setCalendarLanguage(i18n.language);

i18n.on('languageChanged', (lng) => {
  setCalendarLanguage(lng);
});

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      
      <Stack.Screen 
        name="search-results" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}