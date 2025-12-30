import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  I18nManager,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TicketWidget from '../../components/booking/TicketsWidget';
import { getTripsByDateAndLine } from '../../axios/services/searchService';
import HomeIcon from '../../assets/images/icons/Home.svg';
import TicketsIcon from '../../assets/images/icons/Tickets.svg';
import ManageIcon from '../../assets/images/icons/Manage.svg';
import ShipIcon from '../../assets/images/icons/ship-icon.svg';
import BackArrow from '../../assets/images/icons/back-arrow.svg';
import CalendarIcon from '../../assets/images/icons/calendar2.svg';
import FromIcon from '../../assets/images/icons/from-icon.svg';
import ToIcon from '../../assets/images/icons/to-icon.svg';
import FerryRoute from '../../assets/images/icons/ferry-route.svg';
import { Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';


LocaleConfig.locales.ar = {
  monthNames: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ],
  monthNamesShort: [
    'ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون',
    'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'
  ],
  dayNames: [
    'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء',
    'الخميس', 'الجمعة', 'السبت'
  ],
  dayNamesShort: ['أحد', 'اثن', 'ثلا', 'أرب', 'خم', 'جم', 'سب'],
  today: 'اليوم',
};
const convertToArabicNumerals = (number) => {
  if (number === undefined || number === null) return '';
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(number).replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
};
const generateDateOptions = (selectedDateStr, languageCode, calendarType) => {
  const options = [];
  const selectedDate = new Date(selectedDateStr);
  const startDate = new Date(selectedDate);
  startDate.setDate(selectedDate.getDate() - 3);

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const isSelected = currentDate.toDateString() === selectedDate.toDateString();

    let day, date;

    if (calendarType === 'hijri') {
      // Hijri calendar using Intl.DateTimeFormat
      day = new Intl.DateTimeFormat(languageCode, {
        calendar: 'islamic',
        weekday: 'short'
      }).format(currentDate).toUpperCase();

      date = new Intl.DateTimeFormat(languageCode, {
        calendar: 'islamic',
        day: 'numeric',
        month: 'short'
      }).format(currentDate);
    } else {
      // Gregorian calendar
      day = currentDate.toLocaleString(languageCode, { weekday: 'short' }).toUpperCase();
      date = currentDate.toLocaleString(languageCode, { day: 'numeric', month: 'short' });
    }
    options.push({
      day,
      date,
      fullDate: currentDate.toISOString(),
      isSelected,
    });
  }
  return options;
};
const SearchResultsScreen = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const isRTL = i18n.language === 'ar';
  useEffect(() => {
    LocaleConfig.defaultLocale = isRTL ? 'ar' : 'en';
  }, [isRTL]);

  const flatListRef = useRef(null); 
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
   const navigationItems = [
      { icon: () => <HomeIcon style={styles.navIcon} />, label: t('navigation.home'), isActive: true },
      { icon: () => <TicketsIcon style={styles.navIcon} />, label: t('navigation.tickets'), isActive: false },
      { icon: () => <ManageIcon style={styles.navIcon} />, label: t('navigation.manage'), isActive: false },
    ];

  const fromPort = searchParams?.fromPort || "Unknown Port";
  const toPort = searchParams?.toPort || "Unknown Port";
  const initialTravelDate = searchParams?.travelDate || new Date().toISOString();
  const travelClass = searchParams?.travelClass || "Economy";
  const lineCode = searchParams?.lineCode;
  const travelClassId = searchParams?.travelClassId;
  
  const [selectedDate, setSelectedDate] = useState(initialTravelDate);
  const [passengers, setPassengers] = useState({ adult: 1, child: 0, infant: 0 });
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [tripsData, setTripsData] = useState([]);
  const [calendarType, setCalendarType] = useState('gregorian');
  const SCREEN_WIDTH = Dimensions.get('window').width;

  useEffect(() => {
    if (searchParams.passengers) {
      try {
        const parsedPassengers = JSON.parse(searchParams.passengers);
        setPassengers(parsedPassengers);
      } catch (error) {
        console.error("Failed to parse passengers:", error);
      }
    }
  }, [searchParams.passengers]);

   useEffect(() => {
    const selectedIndex = dateOptions.findIndex(item => item.isSelected);
    if (selectedIndex !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({
          index: selectedIndex,
          animated: true,
          viewPosition: 0, 
        });
      }, 100); 
    }
  }, [selectedDate, dateOptions]);

  const vesselData = useMemo(() => {
    if (!Array.isArray(tripsData) || tripsData.length === 0) return [];

    const formatTime = (isoString) => {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "--:--";
      return d.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString, locale, calendar) => {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "--";

      // Hijri calendar
      if (calendar === 'hijri') {
        return new Intl.DateTimeFormat(locale, {
          calendar: 'islamic',
          weekday: locale === 'ar' ? 'long' : 'short',
          day: 'numeric',
          month: locale === 'ar' ? 'long' : 'short',
        }).format(date);
      }

      // Gregorian calendar
      return new Intl.DateTimeFormat(locale, {
        weekday: locale === 'ar' ? 'long' : 'short',
        day: 'numeric',
        month: locale === 'ar' ? 'long' : 'short',
      }).format(date);
    };

    return tripsData.map((vessel) => {
      const departureDate = new Date(vessel.tripStartDate);
      const arrivalDate = new Date(vessel.tripEndDate);
      const durationMs = arrivalDate - departureDate;
      const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      const cost = parseFloat(vessel.estimatedCostConverted || 0);

      return {
        tripSerial: vessel.tripSerial,
        tripName: vessel.tripName || vessel.tripDescription,
        vesselName: i18n.language === 'ar' ? vessel.vesselArabName : vessel.vesselEnglishName,
        estimatedCost: cost.toLocaleString(i18n.language, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        fromPortName: fromPort,
        toPortName: toPort,
        startDate: formatDate(vessel.tripStartDate, i18n.language, calendarType),
        endDate: formatDate(vessel.tripEndDate, i18n.language, calendarType),
        departureTime: formatTime(vessel.tripStartDate),
        arrivalTime: formatTime(vessel.tripEndDate),
        duration: days > 0 ? `Est. ${days}d ${hours}h` : `Est. ${hours}h`,
        icon: <ShipIcon width={35} height={35}/>,
        currencySymbol: vessel.currencySymbol,
        currencyPrint: i18n.language === 'ar' ? vessel.currencyArbPrint : vessel.currencyPrint,
        quotaStatus: vessel.quotaStatus,
        isAvailable: vessel.quotaStatus?.available || false,
        seatsRemaining: vessel.quotaStatus?.remaining || 0,
      };
    });
  }, [tripsData, i18n.language, fromPort, toPort, calendarType]);

  const totalPassengers = passengers.adult + passengers.child + passengers.infant;
  const passengerText = `${totalPassengers} ${t(totalPassengers > 1 ? 'booking.passengers_plural' : 'booking.passenger')}`;

  const dateOptions = useMemo(
    () => generateDateOptions(selectedDate, i18n.language, calendarType),
    [selectedDate, i18n.language, calendarType]
  );

  useEffect(() => {
    const loadTrips = async () => {
      setIsLoadingTrips(true);
      const fromDate = new Date(selectedDate).toISOString();
      const toDate = new Date(selectedDate).toISOString();

      try {
        const response = await getTripsByDateAndLine(
          fromDate,
          toDate,
          lineCode,
          travelClassId
        );
        setTripsData(response.data || []);
      } catch (error) {
        console.error("❌ Initial trip load failed:", error);
      } finally {
        setIsLoadingTrips(false);
      }
    };

    loadTrips();
  }, [selectedDate, lineCode, travelClassId]);

  const handleTicketPress = (vessel) => {
    if (vessel.seatsRemaining === 0) {
      Alert.alert(
        t('searchResults.noSeatsTitle'),
        t('searchResults.noSeatsMessage'),
        [{ text: t('common.ok') }]
      );
      return;
    }
    if (!vessel.isAvailable || vessel.seatsRemaining < totalPassengers) {
      Alert.alert(
        t('searchResults.quotaWarningTitle'),
        t('searchResults.quotaWarningMessage', { 
          selected: totalPassengers, 
          available: vessel.seatsRemaining 
        }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { 
            text: t('searchResults.continueAnyway'), 
            onPress: () => router.push({
              pathname: "/vessel-details",
              params: { ...vessel, fromPort, toPort },
            })
          }
        ]
      );
    } else {
      router.push({
        pathname: "/vessel-details",
        params: { ...vessel, fromPort, toPort },
      });
    }
  };

  const handleDateSelect = async (dateOption) => {
    if (dateOption.isSelected || isLoadingTrips) return;
    setSelectedDate(dateOption.fullDate);
  };

  const styles = getStyles(isRTL, SCREEN_WIDTH, calendarType);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackArrow style={[styles.backArrowIcon, isRTL && { transform: [{ scaleX: -1 }] }]}/>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>{t('searchResults.title')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.blueSection}>
          <View style={styles.headerContainer}>
            <View style={styles.portInfoContainer}>
              <Text style={styles.portName} numberOfLines={2}>{fromPort}</Text>
              <FerryRoute style={[styles.ferryRouteIcon, isRTL && { transform: [{ scaleX: -1 }] }]}/>
              <Text style={[styles.portName, {textAlign:'center'}]} numberOfLines={2}>{toPort}</Text>
            </View>
            <Text style={styles.passengerInfo}>{`${passengerText} • ${travelClass}`}</Text>
          </View>

          <View style={styles.calendarToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                calendarType === 'gregorian' && styles.toggleButtonSelected
              ]}
              onPress={() => setCalendarType('gregorian')}
            >
              <Text style={[
                styles.toggleText,
                calendarType === 'gregorian' && styles.toggleTextSelected
              ]}>
                {t('searchResults.gregorian')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.toggleButton,
                calendarType === 'hijri' && styles.toggleButtonSelected
              ]}
              onPress={() => setCalendarType('hijri')}
            >
              <Text style={[
                styles.toggleText,
                calendarType === 'hijri' && styles.toggleTextSelected
              ]}>
                {t('searchResults.hijri')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dateSelectionContainer}>
            <TouchableOpacity style={styles.calendarIconContainer} onPress={() => setIsCalendarVisible(true)}>
              <CalendarIcon style={styles.calendarIcon}/>
            </TouchableOpacity>
            <FlatList
              ref={flatListRef}
              horizontal
              data={dateOptions}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.fullDate}
              contentContainerStyle={{ paddingEnd: 24 }}
              inverted={I18nManager.isRTL}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dateButton, item.isSelected && styles.selectedDateButton]}
                  onPress={() => handleDateSelect(item)}
                  disabled={isLoadingTrips}
                >
                  <Text style={[styles.dayText, item.isSelected && styles.selectedDayText]}>
                    {item.day}
                  </Text>
                  <Text style={[styles.dateText, item.isSelected && styles.selectedDateText]}>
                    {item.date}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.vesselListContainer}>
            <Text style={styles.availableVesselsHeader}>{t('searchResults.availableVessels')}</Text>
            {isLoadingTrips ? (
              <ActivityIndicator size="large" color="#092863" />
            ) : vesselData.length > 0 ? (
              vesselData.map((vessel, index) => (
                <TouchableOpacity key={index} onPress={() => handleTicketPress(vessel)}>
                  <TicketWidget>
                    <View style={styles.vesselCardHeader}>
                      <Text style={styles.vesselName}>{vessel.vesselName || 'N/A'}</Text>           
                      { vessel.seatsRemaining < totalPassengers && (
                      <View style={[
                        styles.warningBanner,
                        vessel.seatsRemaining === 0 && styles.warningBannerError
                      ]}>
                        <Text style={[
                          styles.warningText,
                          vessel.seatsRemaining === 0 && styles.warningTextError
                        ]}>
                          {vessel.seatsRemaining === 0 
                            ? t('searchResults.noSeatsRemaining')
                            : t('searchResults.seatsRemaining', { count: vessel.seatsRemaining })
                          }
                        </Text>
                      </View>
                    )}      
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.vesselDetailsContainer}>
                      <View style={styles.portDetailColumn}>
                        <View style={styles.badge}>
                          <FromIcon style={styles.badgeIcon}/>
                          <Text style={styles.badgeText}>{t('searchResults.departure')}</Text>
                        </View>
                        <Text style={styles.portNameDetail}>{fromPort || 'N/A'}</Text>
                        <Text style={styles.dateTimeText}>{vessel.startDate || '--'}</Text>
                        <Text style={styles.dateTimeText}>{vessel.departureTime || '--:--'}</Text>
                      </View>
                      <View style={styles.routeColumn}>
                        {vessel.icon}
                        <Text style={styles.durationText}>{vessel.duration || 'N/A'}</Text>
                      </View>
                      <View style={styles.portDetailColumn}>
                        <View style={styles.badgeRight}>
                          <ToIcon style={styles.badgeIcon}/>
                          <Text style={styles.badgeText}>{t('searchResults.arrival')}</Text>
                        </View>
                        <Text style={styles.portNameDetailRight}>{toPort || 'N/A'}</Text>
                        <Text style={styles.dateTimeTextRight}>{vessel.endDate || '--'}</Text>
                        <Text style={styles.dateTimeTextRight}>{vessel.arrivalTime || '--:--'}</Text>
                      </View>                
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.priceDetails}>
                        <View >
                          <Text style={styles.estPriceLabel}>{t('searchResults.estPrice')}</Text>
                          <Text style={{ textAlign: isRTL ? 'right' : 'left' }}>
                            <Text style={styles.price}>{vessel.estimatedCost || '0.00'}</Text>
                            <Text style={styles.paxText}>{vessel.currencyPrint ? ` ${vessel.currencyPrint}` : ''}</Text>
                          </Text>
                        </View>
                        <View style={styles.selectButton}>
                          <Text style={styles.selectButtonText}>{t('searchResults.select')}</Text>
                        </View>
                    </View> 
                  </TicketWidget>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ textAlign: isRTL ? 'right' : 'left' }}>{i18n.language === 'ar' ? 'لا توجد رحلات متاحة للتاريخ المحدد.' : 'No trips available for the selected date.'}</Text>
            )}
          </View>
        </View>
      </ScrollView>
      <View style={styles.navigation}>
        {navigationItems.map((item) => (
          <TouchableOpacity key={item.label} style={[styles.navItem, item.isActive && styles.navItemActive]}>
              {typeof item.icon === 'function' ? (
                  item.icon()) : (
                    <Image source={item.icon} style={[styles.navIcon, item.isActive && styles.navIconActive]} />)}
                    <Text style={[styles.navLabel, item.isActive && styles.navLabelActive]}>{item.label}</Text>
          </TouchableOpacity>))}
      </View>
      <Modal
          visible={isCalendarVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsCalendarVisible(false)}>
          <View style={styles.calendarOverlay}>
            <View style={styles.calendarContainer}>
              <Calendar
                monthFormat={'MMMM yyyy'}
                onDayPress={(day) => {
                  setSelectedDate(new Date(day.dateString).toISOString());
                  setIsCalendarVisible(false);
                }}
                markedDates={{
                  [selectedDate.split('T')[0]]: {
                    selected: true,
                    selectedColor: '#6291E8',
                  },
                }}
                theme={{
                  todayTextColor: '#6291E8',
                  arrowColor: '#6291E8',
                  textDayFontFamily: 'Cairo-Regular',
                  textMonthFontFamily: 'Cairo-Bold',
                  textDayHeaderFontFamily: 'Cairo-Medium',
                }}
              />
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsCalendarVisible(false)}>
                <Text style={styles.closeButtonText}>{t('searchResults.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (isRTL, SCREEN_WIDTH, calendarType) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
screenHeader: {
  flexDirection: isRTL ? 'row-reverse' : 'row',
  alignItems: 'center',
  justifyContent: 'center',  // Center the container
  paddingHorizontal: 24,
  paddingVertical: 20,
  backgroundColor: 'white',
  borderBottomColor: '#f0f0f0',
  position: 'relative',  // Add this for absolute positioning context
},
backButton: {
  position: 'absolute',  // Position absolutely within header
  [isRTL ? 'right' : 'left']: 24,  // Position based on direction
  width: 44,
  height: 44,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,  // Ensure it's above title
},
backArrowIcon: {
  width: 84,
  height: 34,
},
screenTitle: {
  fontFamily: 'Cairo-Bold',
  fontSize: 18,
  color: 'black',
  textAlign: 'center',
},
  scrollViewContent: {
    flexGrow: 1,
  },
  blueSection: {
    backgroundColor: '#ECF3FF',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 24,
  },
  portInfoContainer: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,  // ✅ Add consistent gap between elements
  },
  portName: {
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    color: 'black',
    fontSize: 16,
    flex: 1,
    textAlign: isRTL ? 'right' : 'left',  // ✅ Proper alignment for each direction
  },
  ferryRouteIcon: {
    width: 80,
    height: 37,
    resizeMode: 'contain',
    marginHorizontal: 8,  // ✅ Keep some margin or remove if using gap
    flexShrink: 0,  // ✅ Prevent icon from shrinking
  },
  passengerInfo: {
    fontFamily: 'Cairo-Medium',
    fontWeight: '600',
    color: '#000000ff',
    fontSize: 14,
    paddingVertical: 0,
    textAlign: isRTL ? 'right' : 'left',
  },
  calendarToggle: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  toggleButtonSelected: {
    backgroundColor: '#6291E8',
    borderColor: '#6291E8',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Cairo-Medium',
    fontWeight: '600',
    color: '#333',
  },
  toggleTextSelected: {
    color: 'white',
  },
  dateSelectionContainer: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingLeft: isRTL ? 0 : 24,
    paddingRight: isRTL ? 24 : 0,
    paddingBottom: 24,
  },
  calendarIconContainer: {
    width: 73,
    height: 73,
    backgroundColor: '#6291E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: isRTL ? 0 : 12,
    marginStart: isRTL ? 12 : 0,
    flexShrink: 0,  // ✅ Prevent calendar icon from shrinking
  },
  calendarIcon: {
    width: 23.6,
    height: 26.5,
    tintColor: 'white',
  },
dateButton: {
  width: isRTL && calendarType === 'hijri' ? 90 : 73,  // ✅ Wider for Arabic Hijri
  height: 73,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  backgroundColor: 'white',
  marginEnd: isRTL ? 0 : 12,
  marginStart: isRTL ? 12 : 0,
  paddingHorizontal: 6,  // ✅ More padding for longer text
  flexShrink: 0,
},
  selectedDateButton: {
    backgroundColor: '#BAD4FF',
  },
  dayText: {
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#B6BDCF',
    marginBottom: 4,
    numberOfLines: 1,  // ✅ Not directly applicable here, add to Text component
    textAlign: 'center',  // ✅ Center the text
  },
  selectedDayText: {
    color: '#6291E8',
  },
dateText: {
  fontFamily: 'Cairo-Bold',
  fontWeight: 'bold',
  fontSize: isRTL && calendarType === 'hijri' ? 13 : 16,  // ✅ Smaller font for Hijri
  color: 'black',
  textAlign: 'center',
  paddingHorizontal: 2,
},
  selectedDateText: {
    color: '#092863',
  },
  whiteSection: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32, 
  },
  availableVesselsHeader: {
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#092863aa',
    alignSelf: isRTL ? 'flex-end' : 'flex-start',
    marginBottom: 0,
  },
  vesselListContainer: {
    paddingTop: 10,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  vesselCardHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isRTL ? 0 : 8,
  },
  vesselName: {
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    fontSize: 18,
    color: 'black',
    textAlign: isRTL ? 'right' : 'left',
    marginTop: 8,
    marginLeft: 20,
  },
  estPriceLabel: {
    fontFamily: 'Cairo-Regular',
    fontSize: 15,
    color: '#7E92B9',
    textAlign: isRTL ? 'right' : 'left',
  },
  price: {
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    color: '#6291E8',
    fontSize: 18,
  },
  priceDetails:{
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent:'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  paxText: {
    fontSize: 16,
    color: 'black',
  },
  separator: {
    height: 1,
    backgroundColor: '#e7e5e5ff',
    marginVertical: 16,
    width: SCREEN_WIDTH - 95,
    marginLeft: isRTL ? 20 : 20,
    // marginRight: isRTL ? 20 : 0,
  },
  vesselDetailsContainer: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  portDetailColumn: {
    flex: 0.4,
    gap: 4,
  },
  routeColumn: {
    flex: 0.2,
    alignItems: 'center',
    paddingTop: 30,
    gap: 4,
  },
  badge: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: '#EDF3FF',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
    alignSelf: isRTL ? 'flex-end' : 'flex-start',
  },
  badgeRight: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: '#EDF3FF',
    borderRadius: 20,
    paddingHorizontal: 17,
    paddingVertical: 4,
    gap: 8,
    alignSelf: isRTL ? 'flex-start' : 'flex-end',
  },
  badgeIcon: {
    width: 16,
    height: 16,
  },
  badgeText: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    color: '#5C7096',
    fontSize: 13,
  },
  portNameDetail: {
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
    marginTop: 8,
    textAlign: isRTL ? 'right' : 'left',
  },
  portNameDetailRight: {
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
    marginTop: 8,
    textAlign: isRTL ? 'left' : 'right',
  },
  dateTimeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'black',
    lineHeight: 20,
    textAlign: isRTL ? 'right' : 'left',
  },
  dateTimeTextRight: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'black',
    lineHeight: 20,
    textAlign: isRTL ? 'left' : 'right',
  },
  shipIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  durationText: {
    fontFamily: 'Inter-Regular',
    color: '#5C7096',
    fontSize: 12,
  },
  navigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    height: 95,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 48,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#d8e4f6',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 15.9,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  navIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#878d9a',
  },
  navIconActive: {
    tintColor: '#092863',
  },
  navItemActive: {
    backgroundColor: '#ecf1f9',
  },
  navLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#878d9a',
  },
  navLabelActive: {
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold',
      color: '#092863',
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
  },
  selectButton: { marginTop: 10, paddingVertical: 14, paddingHorizontal: 30, backgroundColor: '#0A2351', borderRadius: 12, alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row', },
  selectButtonText: { color: 'white', fontWeight: 'bold' },
  closeButton: { marginTop: 10, paddingVertical: 14, backgroundColor: '#0A2351', borderRadius: 12, alignItems: 'center' },
  closeButtonText: { color: 'white', fontWeight: 'bold' },
  warningBanner: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 14,
    color: '#856404',
    textAlign: isRTL ? 'right' : 'left',
  },
  warningBannerError: {
    backgroundColor: '#F8D7DA',
    borderLeftColor: '#DC3545',
  },
  warningTextError: {
    color: '#721C24',
  },
});

export default SearchResultsScreen;