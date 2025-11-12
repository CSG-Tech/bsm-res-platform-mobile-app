import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { createGuestSession } from '../axios/services/authService';
import { getTokens } from '../axios/storage/tokenStorage'; 

import { configureCalendar, setCalendarLanguage } from '../config/calendarConfig';
import i18n from './i18n';

configureCalendar();
setCalendarLanguage(i18n.language);
i18n.on('languageChanged', (lng) => {
  setCalendarLanguage(lng);
});


export default function RootLayout() {
  const [isSessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const tokens = await getTokens();
        
        if (!tokens || !tokens.accessToken) {
          console.log('No active session found. Creating a new guest session...');
          await createGuestSession();
        } else {
          console.log('User session restored from storage.');
        }
      } catch (error) {

        console.error('Failed to initialize user session:', error);
      } finally {
        setSessionReady(true);
      }
    };

    initializeSession();
  }, []); 

  if (!isSessionReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#092863" />
        <Text style={{ marginTop: 15, fontSize: 16 }}>Initializing Session...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="search-results" options={{ headerShown: false }} />
      <Stack.Screen name="vessel-details" options={{ headerShown: false }} />
      <Stack.Screen name="reservation" options={{ headerShown: false }} />
    </Stack>
  );
}