import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  I18nManager,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { clearPendingReservation } from '../../axios/storage/reservationStorage';

const FailedBooking = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const params = useLocalSearchParams();
  const reservationId = params.reservationId;

  const handleRetryPayment = () => {
    if (reservationId) {
        router.back();
    } else {
      router.dismissAll();
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#edf3ff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={async () => {
            await clearPendingReservation(); 
            router.dismissAll(); 
            router.replace('/')
            }} style={styles.iconButton}>
            <X size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('failedBooking.headerTitle')}</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.alertBanner}>
          <View style={[styles.bannerHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Image 
              source={require('../../assets/images/icons/error.png')} 
              style={styles.errorIcon}
            />
            <Text style={styles.alertTitle}>{t('failedBooking.alertTitle')}</Text>
          </View>
          <Text style={[styles.alertMessage, { textAlign: isRTL ? 'right' : 'left' }]}>
            <Trans
              i18nKey="failedBooking.alertMessage"
              components={{
                1: <Text style={styles.linkText} />,
                3: <Text style={styles.linkText} />,
              }}
            />
          </Text>
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRetryPayment}>
            <Text style={styles.primaryButtonText}>{t('failedBooking.tryAgain')}</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.secondaryButton} onPress={handleRetryPayment}>
            <Text style={styles.secondaryButtonText}>{t('failedBooking.changePaymentMethod')}</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#edf3ff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#edf3ff',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: 'black',
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBanner: {
    backgroundColor: 'rgba(224, 22, 22, 0.1)',
    padding: 32,
    gap: 16,
  },
  bannerHeader: {
    alignItems: 'center',
    gap: 15,
  },
  errorIcon: {
    width: 48,
    height: 48,
  },
  alertTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#e01515',
  },
  alertMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#e01515',
    lineHeight: 21,
  },
  linkText: {
    fontFamily: 'Inter-Medium',
    textDecorationLine: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#edf3ff',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 13,
  },
  primaryButton: {
    backgroundColor: '#06193b',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
  secondaryButton: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#06193b',
    textDecorationLine: 'underline',
  },
});

export default FailedBooking;