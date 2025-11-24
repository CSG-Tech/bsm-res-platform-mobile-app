import React, { useEffect } from 'react';
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';

// --- Components ---

const SummaryCard = ({ vesselName, pricePerPax, fromPort, toPort, t }) => {
  return (
    <View style={styles.card}>
      {/* Header Part */}
      <View style={styles.cardHeader}>
        <Text style={styles.vesselName}>{vesselName || t('summary.vesselName')}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.estPriceLabel}>{t('summary.estPrice')}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{t('summary.currency')}{pricePerPax}</Text>
            <Text style={styles.paxText}>{t('summary.pax')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.separator} />

      {/* Journey Details Grid */}
      <View style={styles.journeyGrid}>
        
        {/* Departure (FROM) */}
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
            {/* DYNAMIC FROM PORT */}
            <Text style={styles.portName}>{fromPort}</Text>
            <Text style={styles.dateText}>Sun, Sep 14</Text>
            <Text style={styles.timeText}>09:00 AM</Text>
          </View>
        </View>

        {/* Center Icon (SHIP) */}
        <View style={styles.centerColumn}>
          <Image 
            source={require('../../assets/images/icons/ship-icon.png')} 
            style={styles.shipIcon}
            resizeMode="contain"
          />          
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>{t('summary.estDuration', { days: 5, hours: 5 })}</Text>
          </View>
        </View>

        {/* Arrival (TO) */}
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
            {/* DYNAMIC TO PORT */}
            <Text style={styles.portName}>{toPort}</Text>
            <Text style={styles.dateText}>Fri, Sep 18</Text>
            <Text style={styles.timeText}>02:00 PM</Text>
          </View>
        </View>

      </View>
    </View>
  );
};

const BookingDetailsSection = ({ passengerCount, basePrice, t }) => {
  const taxAmount = 20.00;
  const subtotal = (basePrice * passengerCount).toFixed(2);
  const total = (parseFloat(subtotal) + taxAmount).toFixed(2);

  return (
    <View style={styles.detailsSection}>
      <Text style={styles.sectionTitle}>{t('summary.headerTitle')}</Text>

      <View style={styles.subSection}>
        <Text style={styles.subTitle}>{t('summary.passengerLabel')}</Text>
        
        {/* Dynamic Passenger Row */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            {t('summary.adultEconomy', { count: passengerCount })}
          </Text>
          <Text style={styles.rowValue}>{t('summary.currency')}{subtotal}</Text>
        </View>
      </View>

      <View style={styles.costSection}>
        {/* Subtotal */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('summary.subtotal')}</Text>
          <Text style={styles.rowValue}>{t('summary.currency')}{subtotal}</Text>
        </View>

        {/* Taxes */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('summary.taxes')}</Text>
          <Text style={styles.rowValue}>{t('summary.currency')}{taxAmount.toFixed(2)}</Text>
        </View>
        
        {/* Total */}
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>{t('summary.total')}</Text>
          <Text style={styles.totalValue}>{t('summary.currency')}{total}</Text>
        </View>
      </View>
    </View>
  );
};

const SummaryScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  
  // 1. Get params passed from Reservation Screen
  const params = useLocalSearchParams();

  // Debugging: Check your terminal to see if data is arriving
  useEffect(() => {
    console.log("Summary Screen Params Received:", params);
  }, [params]);

  const vesselName = params.vesselName || "MSC Bellissima";
  const passengerCount = params.passengerCount ? parseInt(params.passengerCount) : 1;
  const pricePerPax = params.price ? parseFloat(params.price) : 230.00;
  
  // 2. Extract Ports (with default fallbacks if undefined)
  // If params.fromPort is undefined, it defaults to "Jeddah Islamic Port"
  const fromPort = params.fromPort || "Jeddah Islamic Port";
  const toPort = params.toPort || "Port Sudan";

  const handleContinue = () => {
    router.push({
      pathname: '/payment',
      params: {
        // Pass all data forward to Payment -> Ticket
        passengerCount: params.passengerCount,
        passengersData: params.passengersData, 
        vesselName: params.vesselName,
        price: params.price,
        fromPort: fromPort, // Pass forward
        toPort: toPort      // Pass forward
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={30} color="#000" style={I18nManager.isRTL && { transform: [{ scaleX: -1 }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('summary.headerTitle')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionWrapper}>
            <SummaryCard 
              vesselName={vesselName} 
              pricePerPax={pricePerPax} 
              fromPort={fromPort}
              toPort={toPort}
              t={t} 
            />
          </View>
          
          <View style={styles.sectionWrapper}>
            <BookingDetailsSection 
              passengerCount={passengerCount} 
              basePrice={pricePerPax} 
              t={t} 
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>{t('summary.continue')}</Text>
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
    fontFamily: 'Inter-Medium',
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#7e92b9',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  priceText: {
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#6291e8',
  },
  paxText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'black',
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
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#5c7096',
  },
  portDetails: {
    gap: 4,
    marginTop: 4,
  },
  portName: {
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
    textAlign: 'left', 
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'black',
    textAlign: 'left',
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'black',
    textAlign: 'left',
  },
  durationContainer: {
    backgroundColor: '#fbfcff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  durationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    width: 80,
    textAlign: 'center',
    color: '#5c7096',
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
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default SummaryScreen;