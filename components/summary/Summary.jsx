import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  I18nManager,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
import { getTripSummary } from '../../axios/services/ticketService';
import { getAllPrices } from '../../axios/services/reservationService';
import { 
  savePendingReservation, 
  getPendingReservation, 
  clearPendingReservation
} from '../../axios/storage/reservationStorage';
import { 
  createReservation, 
  updateReservationPassengers, 
  expireReservation } from '../../axios/services/ticketService';
import { useFocusEffect } from 'expo-router';
const SummaryCard = ({ tripData, t }) => {
  if (!tripData) return null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.vesselName}>{tripData.vessel || t('summary.vesselName')}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.estPriceLabel}>{tripData.tripName}</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.journeyGrid}>
        <View style={styles.journeyColumn}>
          <View style={styles.badge}>
            <Image 
              source={require('../../assets/images/icons/to-icon.png')} 
              style={[
                styles.arrowIcon, 
                { transform: [{ rotate: I18nManager.isRTL ? '135deg' : '-45deg' }] }
              ]} 
              resizeMode="contain"
            />
            <Text style={styles.badgeText}>{t('summary.departure')}</Text>
          </View>
          <View style={styles.portDetails}>
            <Text style={styles.portName}>
              {I18nManager.isRTL ? tripData.fromPortArab : tripData.fromPortEng}
            </Text>
            <Text style={styles.dateText}>
              {new Date(tripData.startDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.centerColumn}>
          <Image 
            source={require('../../assets/images/icons/ship-icon.png')} 
            style={styles.shipIcon}
            resizeMode="contain"
          />          
        </View>

        <View style={styles.journeyColumn}>
          <View style={styles.badge}>
            <Image 
              source={require('../../assets/images/icons/to-icon.png')} 
              style={[
                styles.arrowIcon, 
                { transform: [{ rotate: I18nManager.isRTL ? '-135deg' : '45deg' }] }
              ]}
              resizeMode="contain"
            />            
            <Text style={styles.badgeText}>{t('summary.arrival')}</Text>
          </View>
          <View style={styles.portDetails}>
            <Text style={styles.portName}>
              {I18nManager.isRTL ? tripData.toPortArab : tripData.toPortEng}
            </Text>
            <Text style={styles.dateText}>
              {new Date(tripData.endDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const BookingDetailsSection = ({ passengers, prices, t, i18n }) => {
  const subtotal = passengers.reduce((sum, p) => {
    const priceDetail = prices.find(pr => pr.degreeCode === p.degree?.oracleDegreeCode);
    return sum + (priceDetail?.convertedPrice || 0);
  }, 0);

  const taxAmount = 0; // Adjust if needed
  const total = subtotal + taxAmount;

  return (
    <View style={styles.detailsSection}>
      <Text style={styles.sectionTitle}>{t('summary.headerTitle')}</Text>

      <View style={styles.subSection}>
        <Text style={styles.subTitle}>{t('summary.passengerLabel')}</Text>
        
        {passengers.map((p, idx) => {
          const priceDetail = prices.find(pr => pr.degreeCode === p.degree?.oracleDegreeCode);
          const passengerPrice = priceDetail?.convertedPrice || 0;
          const degreeName = i18n.language === 'ar' 
            ? p.degree?.degreeArabName 
            : p.degree?.degreeEnglishName;
          
          return (
            <View key={idx} style={styles.row}>
              <Text style={styles.rowLabel}>
                {`${p.firstName} ${p.lastName} - ${degreeName}`}
              </Text>
              <Text style={styles.rowValue}>
                {passengerPrice.toFixed(2)} {priceDetail?.currencyPrint || 'SAR'}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.costSection}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('summary.subtotal')}</Text>
          <Text style={styles.rowValue}>
            {subtotal.toFixed(2)} {prices[0]?.currencyPrint || 'SAR'}
          </Text>
        </View>

        {taxAmount > 0 && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('summary.taxes')}</Text>
            <Text style={styles.rowValue}>
              {taxAmount.toFixed(2)} {prices[0]?.currencyPrint || 'SAR'}
            </Text>
          </View>
        )}
        
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>{t('summary.total')}</Text>
          <Text style={styles.totalValue}>
            {total.toFixed(2)} {prices[0]?.currencyPrint || 'SAR'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const SummaryScreen = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams();

  const [tripData, setTripData] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  // Parse payload
  const parsedPayload = React.useMemo(() => {
    try {
      return JSON.parse(params.payload);
    } catch (err) {
      console.error('Failed to parse payload:', err);
      return null;
    }
  }, [params.payload]);

  useFocusEffect(
    useCallback(() => {
      setLoadingPayment(false); 
    }, [])
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!parsedPayload?.tripSerial) {
        setError('Invalid trip data');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch trip summary and prices in parallel
        const [summaryRes, pricesRes] = await Promise.all([
          getTripSummary(parsedPayload.tripSerial),
          getAllPrices(parsedPayload.tripSerial)
        ]);

        setTripData(summaryRes);
        setPrices(pricesRes.data || pricesRes || []);
        
        console.log('Trip Summary:', summaryRes);
        console.log('Verified Prices:', pricesRes.data || pricesRes);
        
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parsedPayload?.tripSerial]);

const retryCountRef = useRef(0);

const handleContinue = async () => {
  if (!parsedPayload || !tripData || !prices.length) return;
  setLoadingPayment(true);
  // Check retry limit using ref (always current)
  if (retryCountRef.current >= 3) {
    await clearPendingReservation();
    retryCountRef.current = 0; // Reset ref
    setRetryCount(0); // Reset state
    Alert.alert(
      t('summary.error'),
      t('summary.tooManyRetries'),
      [
        {
          text: t('summary.ok'),
          onPress: () => {
            router.dismissAll();
            router.replace('/');
          }   
        }
      ]
    );
    return;
  }

  const existingReservationId = await getPendingReservation();
  console.log('we should be retrying now with reservation id:', existingReservationId);
  
  if (retryCountRef.current > 0) {
    try{
      await expireReservation(existingReservationId);
    }
    catch(err){
      console.error('Error expiring reservation before retry:', err);
    }
    console.log(`Retry attempt #${retryCountRef.current}`);
  }
  
  // Prepare verified passengers
  const verifiedPassengers = parsedPayload.passengers.map(p => {
    const priceDetail = prices.find(pr => pr.degreeCode === p.degree?.oracleDegreeCode);
    return {
      ...p,
      verifiedPrice: priceDetail?.convertedPrice || 0,
      currency: priceDetail?.currencyPrint || 'SAR'
    };
  });

  // Build the payload
  const reservationPayload = {
    tripSerial: Number(parsedPayload.tripSerial),
    priceListTrxNo: Number(tripData.priceListTrxNo),
    passengers: verifiedPassengers.map(p => ({
      passengerFirstName: p.firstName,
      passengerMiddleName: p.middleName || undefined,
      passengerLastName: p.lastName,
      gender: p.gender,
      birthdate: p.birthdate,
      nationalityCode: Number(p.nationality?.oracleNatCode),
      birthplace: p.birthplace,
      degreeCode: Number(p.degree?.oracleDegreeCode),
      visaTypeCode: p.visaType?.oracleVisaTypeCode ? Number(p.visaType.oracleVisaTypeCode) : undefined,
      visaNumber: p.visaNumber || undefined,
      passportNumber: p.passportNumber,
      passportIssueDate: p.passportIssuingDate,
      passportExpiryDate: p.passportExpirationDate,
    }))
  };

  try {
    let reservationId;
    
    if (existingReservationId) {
      await updateReservationPassengers(existingReservationId, reservationPayload);
      reservationId = existingReservationId;
      console.log('✅ Updated existing reservation:', reservationId);
    } else {
      const reservation = await createReservation(reservationPayload);
      reservationId = reservation.reservationId;
      await savePendingReservation(reservationId);
      console.log('✅ Created new reservation:', reservationId);
    }
    
    // Reset on success
    retryCountRef.current = 0;
    setRetryCount(0);
    setLoadingPayment(false);
    router.push({
      pathname: '/payment',
      params: {
        reservationId: String(reservationId),
        tripSerial: parsedPayload.tripSerial,
        priceListTrxNo: tripData.priceListTrxNo,
        passengersData: JSON.stringify(verifiedPassengers),
        tripData: JSON.stringify(tripData)
      }
    });
  } catch (err) {
    console.error('❌ Reservation error:', err.response?.data || err);
    
    // Increment ref (immediately available)
    retryCountRef.current += 1;
    setRetryCount(retryCountRef.current); // Keep state in sync for UI
    console.log(`Incremented retry count to ${retryCountRef.current}`);
    
    Alert.alert(
      t('summary.error'),
      err.response?.data?.message || err.message || t('summary.reservationFailed'),
      [
        {
          text: t('summary.ok'),
          onPress: () => {setLoadingPayment(false); }
        },
        {
          text: t('summary.retry'),
          onPress: () => handleContinue()
        }
      ]
    );
  }
};
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#092863" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !parsedPayload) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Invalid data'}</Text>
          <TouchableOpacity 
            style={styles.backButtonError} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>{t('common.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={30} color="#000" style={I18nManager.isRTL && { transform: [{ scaleX: -1 }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('summary.headerTitle')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionWrapper}>
            <SummaryCard tripData={tripData} t={t} />
          </View>
          
          <View style={styles.sectionWrapper}>
            <BookingDetailsSection 
              passengers={parsedPayload.passengers}
              prices={prices}
              t={t}
              i18n={i18n}
            />
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.continueButton, 
              loadingPayment && styles.continueButtonDisabled // <-- Add this
            ]} 
            onPress={handleContinue}
            disabled={loadingPayment} // <-- Prevent clicks
          >
            {loadingPayment ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.continueButtonText}>{t('summary.continue')}</Text>
            )}
          </TouchableOpacity>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 16,
    color: '#5c7095',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  backButtonError: {
    backgroundColor: '#092863',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 14,
    color: 'white',
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
  backButton: {
    position: 'absolute',
    left: 24,
    bottom: 20,
  },
  headerTitle: {
    fontFamily: 'Cairo-Medium',
    fontSize: 16,
    color: 'black',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 24,
  },
  sectionWrapper: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 23,
    shadowColor: '#ffffffff', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  vesselName: {
    fontFamily: 'Cairo-Bold',
    padding: 10, 
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'left',
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  estPriceLabel: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: '#7e92b9',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 10,
  },
  journeyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20, 
  },
  journeyColumn: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 8,
  },
  centerColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    width: 100,
  },
  arrowIcon: {
    width: 14,
    height: 14,
    tintColor: '#5c7096', 
  },
  shipIcon: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcfcfcff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 13,
    color: '#5c7096',
  },
  portDetails: {
    gap: 4,
    marginTop: 4,
  },
  portName: {
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
    textAlign: 'left', 
  },
  dateText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: 'black',
    textAlign: 'left',
  },
  detailsSection: {
    backgroundColor: 'white',
    padding: 24, 
    paddingVertical: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subSection: {
    gap: 10,
    marginBottom: 16,
  },
  subTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'black',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  rowLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'black',
    flex: 1,
  },
  rowValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'black',
  },
  costSection: {
    gap: 16,
    marginTop: 6,
  },
  totalRow: {
    marginTop: 8,
  },
  totalLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  totalValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#06193b',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 16,
    paddingBottom: 34,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  continueButton: {
    backgroundColor: '#06193b',
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  continueButtonDisabled: {
    backgroundColor: '#a0a0a0', // greyed out
  },
});

export default SummaryScreen;