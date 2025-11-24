
import { useRouter } from 'expo-router';
import { ArrowLeft, Ship } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    I18nManager,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const VesselDetailsScreen = ({ route }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const params = route.params || {};

  const facilities = [
    { icon: require('../../assets/images/luggage-icon.png'), label: t('facilities.luggage') },
    { icon: require('../../assets/images/food-icon.png'), label: t('facilities.food') },
    { icon: require('../../assets/images/internet-icon.png'), label: t('facilities.internet') },
    { icon: require('../../assets/images/schedule.png'), label: t('facilities.reschedule') },
    { icon: require('../../assets/images/refund-icon.png'), label: t('facilities.refundable') },
  ];

  const handleBookVessel = () => {
    router.push({pathname:'/reservation', params: params});
  };

  const vessel = {
    vesselName: params.vesselName,
    price: params.estimatedCost,
    currency: params.currencyPrint,
    departureDate: params.startDate,
    departureTime: params.departureTime,
    arrivalDate: params.endDate,
    arrivalTime: params.arrivalTime,
    duration: params.duration,
  };
  const fromPort = params.fromPort;
  const toPort = params.toPort;

  const rtlTextAlign = { textAlign: I18nManager.isRTL ? 'right' : 'left' };
  const rtlFlexDirection = { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' };
  const rtlAlignItems = I18nManager.isRTL ? { alignItems: 'flex-end' } : {};
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" style={I18nManager.isRTL && { transform: [{ scaleX: -1 }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('details.headerTitle')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <View style={[styles.cardHeader, rtlFlexDirection]}>
              <Text style={[styles.vesselName, rtlTextAlign]}>{vessel.vesselName}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>{t('details.estPrice')}</Text>
                <Text>
                  <Text style={styles.priceValue}>{vessel.currency}</Text>
                  <Text style={styles.priceValue}>{vessel.price}</Text>
                  <Text style={styles.pricePax}>{t('details.pax')}</Text>
                </Text>
              </View>
            </View>

            <View style={[styles.timelineSection, rtlFlexDirection]}>
              <View style={styles.timelineVisuals}>
                <View style={styles.timelineCircle} />
                <Image source={require('../../assets/images/dotted-line.png')} style={styles.dottedLine} />
                <View style={styles.timelineCircle} />
              </View>

              <View style={styles.timelineDetails}>
               <View style={[styles.timelineBlock, rtlAlignItems]}>
                  <View style={[styles.badge, rtlFlexDirection]}>
                    <Image source={require('../../assets/images/icons/from-icon.png')} style={styles.badgeIcon} />
                    <Text style={styles.badgeText}>{t('details.departure')}</Text>
                  </View>
                  <Text style={[styles.portName, rtlTextAlign]}>{fromPort}</Text>
                  <Text style={[styles.dateText, rtlTextAlign]}>{vessel.departureDate}</Text>
                  <Text style={[styles.dateText, rtlTextAlign]}>{vessel.departureTime}</Text>
                </View>

                <View style={[styles.travelTimeContainer, rtlFlexDirection]}>
                  <Ship size={32} color="#6291e8" />
                  <Text style={styles.travelTimeText}>{vessel.duration}</Text>
                </View>

                <View style={[styles.timelineBlock, rtlAlignItems]}>
                  <View style={[styles.badge, rtlFlexDirection]}>
                    <Image source={require('../../assets/images/icons/to-icon.png')} style={styles.badgeIcon} />
                    <Text style={styles.badgeText}>{t('details.arrival')}</Text>
                  </View>
                  <Text style={[styles.portName, rtlTextAlign]}>{toPort}</Text>
                  <Text style={[styles.dateText, rtlTextAlign]}>{vessel.arrivalDate}</Text>
                  <Text style={[styles.dateText, rtlTextAlign]}>{vessel.arrivalTime}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.card, { marginTop: 12 }]}>
            <View style={styles.facilitiesHeader}>
              <Text style={[styles.facilitiesTitle, rtlTextAlign]}>{t('details.facilitiesTitle')}</Text>
            </View>
            <View style={styles.facilitiesList}>
              {facilities.map((facility, index) => (
                <View key={index} style={[styles.facilityItem, rtlFlexDirection]}>
                  <Image source={facility.icon} style={styles.facilityIcon} />
                  <Text style={styles.facilityLabel}>{facility.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookVessel}>
            <Text style={styles.bookButtonText}>{t('details.bookVessel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    shadowColor: '#e8eff9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    ...(I18nManager.isRTL ? { right: 24 } : { left: 24 }),
    bottom: 20,
  },
  headerTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: 'black',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    justifyContent: 'space-between',
    padding: 32,
  },
  vesselName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'black',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontFamily: 'Inter-Regular',
    color: '#7e92b9',
    fontSize: 13,
  },
  priceValue: {
    fontFamily: 'Inter-Bold',
    color: '#6291e8',
    fontSize: 16,
  },
  pricePax: {
    fontFamily: 'Inter-Regular',
    color: 'black',
    fontSize: 14,
  },
  timelineSection: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  timelineVisuals: {
    alignItems: 'center',
    width: 16,
    ...(I18nManager.isRTL ? { marginLeft: 29 } : { marginRight: 29 }),
  },
  timelineCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#7e92b9',
  },
  dottedLine: {
    flex: 1,
    width: 2,
  },
  timelineDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  timelineBlock: {
    gap: 12,
  },
  badge: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#EDF3FF',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
    alignSelf: 'flex-start', 
  },
  badgeIcon: {
    width: 16,
    height: 16,
  },
  badgeText: {
    fontFamily: 'Inter-Medium',
    color: '#5c7096',
    fontSize: 13,
  },
  portName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'black',
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'black',
  },
  travelTimeContainer: {
    alignItems: 'center',
    gap: 14,
    marginVertical: 33,
  },
  travelTimeText: {
    fontFamily: 'Inter-Regular',
    color: '#5c7096',
    fontSize: 13,
  },
  facilitiesHeader: {
    paddingTop: 24,
    paddingHorizontal: 32,
  },
  facilitiesTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'black',
  },
  facilitiesList: {
    padding: 24,
    paddingTop: 16,
    gap: 8,
  },
  facilityItem: {
    alignItems: 'center',
    backgroundColor: '#f5f8ff',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  facilityIcon: {
    width: 24,
    height: 24,
  },
  facilityLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'black',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  bookButton: {
    backgroundColor: '#06193b',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  bookButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
});

export default VesselDetailsScreen;