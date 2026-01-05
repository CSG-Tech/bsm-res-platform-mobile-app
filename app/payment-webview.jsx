// payment-webview.jsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  I18nManager,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { clearPendingReservation } from '../axios/storage/reservationStorage';

const PaymentWebViewScreen = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams();
  const webViewRef = useRef(null);

  const [loading, setLoading] = useState(true);

  // Get token from params (no more paymentData)
  const token = params.token;

  // Define success statuses
  const successStatuses = ['paid', 'authorized', 'success'];

  // Handle messages from WebView
  const handleWebViewMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', message);

      switch (message.type) {
        case 'PAGE_READY':
          setLoading(false);
          break;

        case 'PAYMENT_SUCCESS':
        case 'PAYMENT_FAILED':
        case 'PAYMENT_ERROR':
        case 'PAYMENT_PROCESSING':
          const paymentObj = message.payment ? JSON.parse(message.payment) : null;
          const status = message.type === 'PAYMENT_SUCCESS' ? 'paid' :
                        message.type === 'PAYMENT_FAILED' ? 'failed' :
                        message.type === 'PAYMENT_PROCESSING' ? 'processing' : 'error';
          
          // Route based on status
          if (successStatuses.includes(status)) {
            await clearPendingReservation(); // ✅ Clear on success
            router.replace({
              pathname: '/confirmation',
              params: {
                status,
                reservationId: message.reservationId || '',
                paymentId: paymentObj?.id || message.paymentId || ''
              }
            });
          } else {
            router.replace({
              pathname: '/failed-booking',
              params: {
                status,
                reservationId: message.reservationId || '',
                paymentId: paymentObj?.id || message.paymentId || ''
              }
            });
          }
          break;

        default:
          console.warn('Unhandled WebView message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  // Intercept navigation to handle deep links
  const handleShouldStartLoadWithRequest = (request) => { // ❌ Remove async
    console.log('Navigation request:', request.url);
    
    // Intercept deep link
    if (request.url.startsWith('bassamshipping://')) {
      const urlParts = request.url.split('?');
      const path = urlParts[0].replace('bassamshipping://', '');
      const urlParams = new URLSearchParams(urlParts[1] || '');
      const status = urlParams.get('status');
      const paymentId = urlParams.get('paymentId');
      const reservationId = urlParams.get('reservationId');

      console.log('Deep link intercepted:', { path, status, paymentId, reservationId });

      // Clear reservation and navigate (don't await here)
      const navigateWithClear = async () => {
        if (path === 'confirmation' || path === 'failed-booking') {
          if (path === 'confirmation') {
            await clearPendingReservation();
          }
          router.replace({
            pathname: `/${path}`,
            params: {
              status: status || 'processing',
              paymentId: paymentId || '',
              reservationId: reservationId || ''
            }
          });
        } else {
          // Otherwise, determine the path based on status
          if (successStatuses.includes(status?.toLowerCase())) {
            await clearPendingReservation();
            router.replace({
              pathname: '/confirmation',
              params: {
                status: status || 'paid',
                paymentId: paymentId || '',
                reservationId: reservationId || ''
              }
            });
          } else {
            router.replace({
              pathname: '/failed-booking',
              params: {
                status: status || 'failed',
                paymentId: paymentId || '',
                reservationId: reservationId || ''
              }
            });
          }
        }
      };
      
      navigateWithClear(); // Call async function but don't await

      // Prevent WebView from trying to load the deep link
      return false;
    }

    // Allow all other URLs
    return true;
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('payment.invalidPaymentToken')}</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const API_URL = "https://csg-server-apps.maxapex.net:7000";
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <ArrowLeft size={30} color="#000" style={I18nManager.isRTL && { transform: [{ scaleX: -1 }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('payment.completePayment')}</Text>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#092863" />
            <Text style={styles.loadingText}>{t('payment.loadingPayment')}</Text>
          </View>
        )}

        {/* WebView - Pass token in URL */}
        <WebView
          ref={webViewRef}
          source={{ uri: `${API_URL}/payment.html?token=${token}&lang=${i18n.language}` }}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => setLoading(false)}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          originWhitelist={['*']}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fbfcff' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    zIndex: 10,
  },
  headerBackButton: { position: 'absolute', left: 24, bottom: 20 },
  headerTitle: { fontFamily: 'Inter-Medium', fontSize: 16, color: 'black' },
  loadingContainer: { 
    position: 'absolute', 
    top: '50%', 
    left: 0, 
    right: 0, 
    alignItems: 'center', 
    gap: 16, 
    zIndex: 5 
  },
  loadingText: { fontFamily: 'Inter-Regular', fontSize: 16, color: '#5c7095' },
  webView: { flex: 1, backgroundColor: '#f5f5f5' },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24, 
    gap: 24 
  },
  errorText: { 
    fontFamily: 'Inter-Regular', 
    fontSize: 16, 
    color: '#c33', 
    textAlign: 'center' 
  },
  backButton: { 
    backgroundColor: '#06193b', 
    borderRadius: 16, 
    paddingVertical: 12, 
    paddingHorizontal: 32 
  },
  backButtonText: { fontFamily: 'Inter-Bold', fontSize: 16, color: 'white' },
});

export default PaymentWebViewScreen;