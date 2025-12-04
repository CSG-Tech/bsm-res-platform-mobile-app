import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated
} from 'react-native';

const PaymentResultScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  
  // Animation
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  
  const status = params.status || 'processing';
  const paymentId = params.paymentId;
  const reservationId = params.reservationId;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const getStatusConfig = () => {
    const configs = {
      paid: {
        icon: CheckCircle,
        color: '#28a745',
        bgColor: '#d4edda',
        title: t('paymentResult.successTitle'),
        message: t('paymentResult.successMessage'),
        showContinue: true,
      },
      authorized: {
        icon: CheckCircle,
        color: '#28a745',
        bgColor: '#d4edda',
        title: t('paymentResult.authorizedTitle'),
        message: t('paymentResult.authorizedMessage'),
        showContinue: true,
      },
      failed: {
        icon: XCircle,
        color: '#dc3545',
        bgColor: '#f8d7da',
        title: t('paymentResult.failedTitle'),
        message: t('paymentResult.failedMessage'),
        showContinue: false,
      },
      initiated: {
        icon: Clock,
        color: '#ffc107',
        bgColor: '#fff3cd',
        title: t('paymentResult.initiatedTitle'),
        message: t('paymentResult.initiatedMessage'),
        showContinue: true,
      },
      processing: {
        icon: Clock,
        color: '#ffc107',
        bgColor: '#fff3cd',
        title: t('paymentResult.processingTitle'),
        message: t('paymentResult.processingMessage'),
        showContinue: true,
      },
      error: {
        icon: AlertCircle,
        color: '#dc3545',
        bgColor: '#f8d7da',
        title: t('paymentResult.errorTitle'),
        message: t('paymentResult.errorMessage'),
        showContinue: false,
      },
    };
    return configs[status] || configs.error;
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const handleContinue = () => {
    if (reservationId) {
      router.replace({
        pathname: '/eticket',
        params: { reservationId }
      });
    } else if (paymentId) {
      router.replace({
        pathname: '/eticket',
        params: { paymentId }
      });
    } else {
      router.replace('/eticket');
    }
  };

  const handleTryAgain = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.content,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
            <IconComponent size={64} color={config.color} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{config.title}</Text>

          {/* Message */}
          <Text style={styles.message}>{config.message}</Text>

          {/* Payment/Reservation ID */}
          {(paymentId || reservationId) && (
            <View style={styles.idContainer}>
              <Text style={styles.idLabel}>
                {reservationId ? t('paymentResult.reservationId') : t('paymentResult.paymentId')}
              </Text>
              <Text style={styles.idValue}>{reservationId || paymentId}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {config.showContinue ? (
              <>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleContinue}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>
                    {t('paymentResult.continue')}
                  </Text>
                </TouchableOpacity>
                
                {(status === 'processing' || status === 'initiated') && (
                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={handleTryAgain}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {t('paymentResult.checkLater')}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleTryAgain}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {t('paymentResult.tryAgain')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#06193b',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  idContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  idLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  idValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#06193b',
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#06193b',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#06193b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#06193b',
    fontWeight: 'bold',
  },
});

export default PaymentResultScreen;