import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { createGuestSession } from '../axios/services/authService';
import { getTokens } from '../axios/storage/tokenStorage'; 
import { configureCalendar, setCalendarLanguage } from '../config/calendarConfig';
import i18n from './i18n';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

configureCalendar();
setCalendarLanguage(i18n.language);
i18n.on('languageChanged', (lng) => {
  setCalendarLanguage(lng);
});

export default function RootLayout() {
  const [isSessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  
  // 🔔 Notification listeners refs
  const notificationListener = useRef();
  const responseListener = useRef();

  // 🔔 Setup notification listeners
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log("📩 Notification Received:", notification);
        // Handle notification when app is in foreground
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log("👆 Notification Clicked:", response);
        
        // Navigate based on notification data
        const data = response.notification.request.content.data;
        if (data?.reservationId) {
          router.push(`/eticket?res_id=${data.reservationId}`);
        } else if (data?.screen) {
          router.push(data.screen);
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // 🔐 Initialize session
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
      <Stack.Screen name="find-tickets" options={{headerShown: false}} />
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