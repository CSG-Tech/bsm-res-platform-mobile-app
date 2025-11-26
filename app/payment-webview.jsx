import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
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

const PaymentWebViewScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const webViewRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);

  const paymentData = React.useMemo(() => {
    try {
      return JSON.parse(params.paymentData);
    } catch {
      return null;
    }
  }, [params.paymentData]);

  const reservationId = params.reservationId;

  // Handle messages from WebView
  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', message);

      switch (message.type) {
        case 'PAGE_READY':
          setPageReady(true);
          setLoading(false);
          // Send payment data to WebView
          if (webViewRef.current && paymentData && pageReady) {
            webViewRef.current.postMessage(JSON.stringify(paymentData));
          }
          break;

        case 'PAYMENT_SUCCESS':
          Alert.alert(
            t('payment.success'),
            t('payment.paymentCompleted'),
            [
              {
                text: 'OK',
                onPress: () => {
                  router.replace({
                    pathname: '/eticket',
                    params: {
                      reservationId: reservationId,
                      paymentId: message.payment?.id
                    }
                  });
                }
              }
            ]
          );
          break;

        case 'PAYMENT_FAILED':
          Alert.alert(
            t('payment.error'),
            message.error?.message || t('payment.paymentFailed'),
            [
              {
                text: 'OK',
                onPress: () => router.back()
              }
            ]
          );
          break;

        case 'PAYMENT_ERROR':
          Alert.alert(
            t('payment.error'),
            message.message || t('payment.paymentError'),
            [
              {
                text: 'OK',
                onPress: () => router.back()
              }
            ]
          );
          break;
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  if (!paymentData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('payment.invalidPaymentData')}</Text>
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

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/payment.html` }}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => setLoading(false)}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbfcff',
  },
  container: {
    flex: 1,
  },
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
  headerBackButton: {
    position: 'absolute',
    left: 24,
    bottom: 20,
  },
  headerTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: 'black',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 16,
    zIndex: 5,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#5c7095',
  },
  webView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 24,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#c33',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#06193b',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  backButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
});

export default PaymentWebViewScreen;