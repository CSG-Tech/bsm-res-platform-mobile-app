import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { createGuestSession } from '../../../axios/services/authService';
import { getTokens } from '../../../axios/storage/tokenStorage'; 
import { notifyTokenReady } from '../../../axios/services/api/authInterceptor'; // ADD THIS
import BookingScreen from '../../../components/booking/booking';

export default function HomeScreen() {
  const [isSessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const tokens = await getTokens();
        if (!tokens || !tokens.accessToken) {
          await createGuestSession();
        }
        // Notify interceptor that token is ready
        notifyTokenReady(); // ADD THIS
      } catch (error) {
        console.error('Failed to initialize user session:', error);
      } finally {
        setSessionReady(true);
      }
    };
    initializeSession();
  }, []);

  return (
    <>
      <BookingScreen />
      
      {!isSessionReady && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.9)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <ActivityIndicator size="large" color="#092863" />
          <Text style={{ marginTop: 15, fontSize: 16 }}>Initializing Session...</Text>
        </View>
      )}
    </>
  );
}