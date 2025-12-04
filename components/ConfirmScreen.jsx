import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Copy } from 'lucide-react-native';
import { Trans, useTranslation } from 'react-i18next';
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

const DetailCard = ({ title, children }) => (
  <View style={styles.card}>
    {title && <Text style={[styles.cardTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{title}</Text>}
    {children}
  </View>
);

const DetailRow = ({ label, value, valueStyle, showCopy = false, children }) => (
  <View style={[styles.detailRow, { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}>
    <Text style={styles.detailLabel}>{label}</Text>
    {value ? (
      <View style={[styles.valueContainer, { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
        {showCopy && <Copy size={20} color="#000" style={I18nManager.isRTL ? { marginRight: 8 } : { marginLeft: 8 }} />}
      </View>
    ) : (
      children
    )}
  </View>
);

const ConfirmationScreen = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams();
  const isRTL = i18n.language === 'ar';

  const passengerCount = params.passengerCount ? parseInt(params.passengerCount, 10) : 1;
  const pricePerPax = params.price ? parseFloat(params.price) : 230;
  const vesselName = params.vesselName || "Vessel Name";
  const fromPort = params.fromPort || "Port Name";
  const toPort = params.toPort || "Port Name";

  let passengers = [];
  try {
    passengers = params.passengersData ? JSON.parse(params.passengersData) : [];
  } catch (e) {
    passengers = Array.from({ length: passengerCount }, (_, i) => ({
      id: i + 1, firstName: 'Passenger', lastName: `${i + 1}`,
    }));
  }

  const subtotal = pricePerPax * passengerCount;
  const taxes = 20.00;
  const totalPrice = subtotal + taxes;
  const currency = t('summary.currency', '$');

  const handleNavigate = () => {
    router.push({
      pathname: '/failedbooking',
      params: { ...params }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={28} color="#000" style={isRTL && { transform: [{ scaleX: -1 }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('confirmation.headerTitle')}</Text>
          <View style={styles.iconButton} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successBanner}>
            <View style={[styles.bannerHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Image 
                source={require('../assets/images/icons/checkmark.png')} 
                style={styles.checkmarkIcon}
              />
              <Text style={styles.successTitle}>{t('confirmation.successTitle')}</Text>
            </View>
            <Text style={[styles.successMessage, { textAlign: isRTL ? 'right' : 'left' }]}>
              <Trans
                i18nKey="confirmation.successMessage"
                components={{ 1: <Text style={styles.linkText} />, 3: <Text style={styles.linkText} /> }}
              />
            </Text>
          </View>
          
          <View style={styles.mainContentContainer}>
            <View style={styles.ticketContainer}>
              <View style={styles.ticketContent}>
                <View style={[styles.ticketHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={styles.vesselName}>{vesselName}</Text>
                  <View>
                    <Text style={[styles.estPriceLabel, { textAlign: isRTL ? 'left' : 'right' }]}>{t('confirmation.estPrice')}</Text>
                    <Text>
                      <Text style={styles.price}>{currency}{pricePerPax.toFixed(2)}</Text>
                      <Text style={styles.paxText}>{t('confirmation.pax')}</Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.separator} />
                <View style={[styles.vesselDetailsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={styles.portDetailColumn}>
                    <View style={[styles.badge, { alignSelf: isRTL ? 'flex-end' : 'flex-start', flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Image source={require('../assets/images/icons/from-icon.png')} style={styles.badgeIcon}/>
                      <Text style={styles.badgeText}>{t('confirmation.departure')}</Text>
                    </View>
                    <Text style={[styles.portNameDetail, { textAlign: isRTL ? 'right' : 'left' }]}>{fromPort}</Text>
                    <Text style={[styles.dateTimeText, { textAlign: isRTL ? 'right' : 'left' }]}>Sun, Sep 14</Text>
                    <Text style={[styles.dateTimeText, { textAlign: isRTL ? 'right' : 'left' }]}>09:00 AM</Text>
                  </View>
                  <View style={styles.routeColumn}>
                    <Image source={require('../assets/images/icons/ship-icon.png')} style={styles.shipIcon} />
                    <Text style={styles.durationText}>{t('summary.estDuration', { days: 5, hours: 5 })}</Text>
                  </View>
                  <View style={styles.portDetailColumn}>
                    <View style={[styles.badgeRight, { alignSelf: isRTL ? 'flex-start' : 'flex-end', flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Image source={require('../assets/images/icons/to-icon.png')} style={styles.badgeIcon}/>
                      <Text style={styles.badgeText}>{t('confirmation.arrival')}</Text>
                    </View>
                    <Text style={[styles.portNameDetailRight, { textAlign: isRTL ? 'left' : 'right' }]}>{toPort}</Text>
                    <Text style={[styles.dateTimeTextRight, { textAlign: isRTL ? 'left' : 'right' }]}>Fri, Sep 18</Text>
                    <Text style={[styles.dateTimeTextRight, { textAlign: isRTL ? 'left' : 'right' }]}>02:00 PM</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.ticketNotch, styles.notchLeft]} />
              <View style={[styles.ticketNotch, styles.notchRight]} />
            </View>

            <View style={styles.detailsWidget}>
              <DetailCard title={t('confirmation.transactionDetails')}>
                <DetailRow label={t('confirmation.reservationNumber')} value="1234567890123" showCopy />
                <DetailRow label={t('confirmation.paymentMethod')} value="MasterCard(0123)" />
                <DetailRow label={t('confirmation.paymentState')} value="Complete" />
                <DetailRow label={t('confirmation.totalPrice')} value={`${currency}${totalPrice.toFixed(2)}`} />
              </DetailCard>
              
              <View style={styles.detailsSeparator} />

              <DetailCard title={t('confirmation.priceDetails')}>
                <DetailRow label={t('confirmation.passengers')} />
                <DetailRow label={t('confirmation.adultEconomy', { count: passengerCount })} value={`${currency}${subtotal.toFixed(2)}`} />
                <View style={{height: 12}} />
                <DetailRow label={t('confirmation.subtotal')} value={`${currency}${subtotal.toFixed(2)}`} />
                <DetailRow label={t('confirmation.taxes')} value={`${currency}${taxes.toFixed(2)}`} />
                <DetailRow label={t('confirmation.total')} value={`${currency}${totalPrice.toFixed(2)}`} valueStyle={styles.boldText} />
              </DetailCard>
              
              <View style={styles.detailsSeparator} />

              <DetailCard>
                <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={styles.cardTitle}>{t('confirmation.passenger')}</Text>
                  <Text style={styles.cardTitle}>{t('confirmation.pnr')}</Text>
                </View>
                {passengers.map((p, index) => (
                  <DetailRow key={index} label={`${p.firstName} ${p.lastName}`} value="ABC012" showCopy />
                ))}
              </DetailCard>
              
              <View style={styles.detailsSeparator} />

              <DetailCard title={t('confirmation.contactDetails')}>
                  <Text style={[styles.detailLabel, { marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }]}>Ahmed Ibrahim</Text>
                  <Text style={[styles.detailLabel, { marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }]}>example@gmail.com</Text>
                  <Text style={[styles.detailLabel, { marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }]}>+201234567890</Text>
              </DetailCard>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleNavigate}>
            <Text style={styles.actionButtonText}>{t('eticket.headerTitle')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: '#fff',
    },
    headerTitle: {
      flex: 1,
      padding:20,
      textAlign: 'center',
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: 'black',
    },
    iconButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      paddingBottom: 120,
    },
    successBanner: {
      backgroundColor: '#e6f9f0',
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 24,
    },
    bannerHeader: {
      alignItems: 'center',
      gap: 15,
      marginBottom: 10,
    },
    checkmarkIcon: { 
      width: 48, 
      height: 48, 
      tintColor: '#00cc6d' 
    },
    successTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 20,
      color: '#008848',
    },
    successMessage: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: '#448b6a',
      lineHeight: 21,
    },
    linkText: {
      fontFamily: 'Inter-Medium',
      textDecorationLine: 'underline',
    },
    mainContentContainer: {
      backgroundColor: '#edf3ff',
      paddingTop: 32,
      paddingBottom: 20,
    },
    ticketContainer: {
      marginHorizontal: 24,
      marginBottom: 24,
      backgroundColor: 'white',
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      shadowColor: "#9abdff",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 10,
    },
    ticketContent: {
      padding: 24,
    },
    ticketHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    vesselName: { fontFamily: 'Inter-Bold', fontSize: 18, color: 'black' },
    estPriceLabel: { fontFamily: 'Inter-Regular', fontSize: 15, color: '#7E92B9' },
    price: { fontFamily: 'Inter-Bold', color: '#6291E8', fontSize: 18 },
    paxText: { fontSize: 16, color: 'black' },
    separator: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 16 },
    vesselDetailsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    portDetailColumn: { flex: 0.4, gap: 4 },
    routeColumn: { flex: 0.2, alignItems: 'center', paddingTop: 30, gap: 4 },
    badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF3FF', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, gap: 8 },
    badgeRight: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF3FF', borderRadius: 20, paddingHorizontal: 17, paddingVertical: 4, gap: 8 },
    badgeIcon: { width: 16, height: 16 },
    badgeText: { fontFamily: 'Inter-Medium', color: '#5C7096', fontSize: 13 },
    portNameDetail: { fontFamily: 'Inter-Bold', fontSize: 16, color: 'black', marginTop: 8 },
    portNameDetailRight: { fontFamily: 'Inter-Bold', fontSize: 16, color: 'black', marginTop: 8 },
    dateTimeText: { fontFamily: 'Inter-Regular', fontSize: 14, color: 'black', lineHeight: 20 },
    dateTimeTextRight: { fontFamily: 'Inter-Regular', fontSize: 14, color: 'black', lineHeight: 20 },
    shipIcon: { width: 35, height: 35, resizeMode: 'contain' },
    durationText: { fontFamily: 'Inter-Regular', color: '#5C7096', fontSize: 12 },
    ticketNotch: {
      position: 'absolute',
      top: '50%',
      marginTop: -52,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#edf3ff',
    },
    notchLeft: { left: -22 },
    notchRight: { right: -22 },
    detailsWidget: {
      marginHorizontal: 24,
      backgroundColor: 'white',
      borderRadius: 16,
      shadowColor: "#d8e4f6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.7,
      shadowRadius: 15,
      elevation: 5,
    },
    detailsSeparator: {
      height: 1,
      backgroundColor: '#f0f0f0',
      marginHorizontal: 24,
    },
    card: { 
      backgroundColor: 'transparent',
      padding: 24,
      gap: 16,
    },
    cardTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: 'black', marginBottom: 8 },
    detailRow: { justifyContent: 'space-between', alignItems: 'center' },
    detailLabel: { fontFamily: 'Inter-Regular', fontSize: 16, color: 'black' },
    valueContainer: { alignItems: 'center' },
    detailValue: { fontFamily: 'Inter-Bold', fontSize: 14, color: 'black' },
    boldText: { fontFamily: 'Inter-Bold', fontSize: 16 },
    footer: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      paddingVertical: 16,
      paddingBottom: 34, 
      paddingHorizontal: 24,
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 20,
    },
    actionButton: {
      backgroundColor: '#06193b',
      borderRadius: 16,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonText: {
      fontFamily: 'Inter-Bold',
      fontSize: 16,
      color: 'white',
    },
});

export default ConfirmationScreen;