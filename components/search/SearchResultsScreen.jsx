import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { getTripsByDateAndLine } from '../../axios/services/searchService';
import TicketWidget from '../../components/booking/TicketsWidget';


const STATIC_TRIPS_DATA = [
  {
    tripStartDate: '2025-12-01T10:00:00Z',
    tripEndDate: '2025-12-02T14:30:00Z',
    vesselEnglishName: 'The Voyager',
    vesselArabName: 'الرحالة',
    tripSerial: 101,
    tripName: 'Morning Trip',
  },
  {
    tripStartDate: '2025-12-01T22:00:00Z',
    tripEndDate: '2025-12-03T02:30:00Z',
    vesselEnglishName: 'Neptune Queen',
    vesselArabName: 'ملكة نبتون',
    tripSerial: 102,
    tripName: 'Night Trip',
  },
];


const generateDateOptions = (selectedDateStr, languageCode) => {
  // ... (This function remains unchanged)
  const options = [];
  const selectedDate = new Date(selectedDateStr);
  const startDate = new Date(selectedDate);
  startDate.setDate(selectedDate.getDate() - 3);

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const isSelected = currentDate.toDateString() === selectedDate.toDateString();

    options.push({
      day: currentDate.toLocaleString(languageCode, { weekday: 'short' }).toUpperCase(),
      date: currentDate.toLocaleString(languageCode, { day: 'numeric', month: 'short' }),
      fullDate: currentDate.toISOString(),
      isSelected: isSelected,
    });
  }
  return options;
};

const SearchResultsScreen = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const isRTL = i18n.language === 'ar';

  const navigationItems = [
      { icon: require('../../assets/images/icons/Home.png'), label: t('navigation.home'), isActive: true },
      { icon: require('../../assets/images/icons/Tickets.png'), label: t('navigation.tickets'), isActive: false },
      { icon: require('../../assets/images/icons/Manage.png'), label: t('navigation.manage'), isActive: false },
  ];

  const fromPort = searchParams?.fromPort || "Unknown Port";
  const toPort = searchParams?.toPort || "Unknown Port";
  const initialTravelDate = searchParams?.travelDate || new Date().toISOString();
  const travelClass = searchParams?.travelClass || "Economy";

  const [selectedDate, setSelectedDate] = useState(initialTravelDate);
  const [passengers, setPassengers] = useState({ adult: 1, child: 0, infant: 0 });
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);

  const [tripsData, setTripsData] = useState(STATIC_TRIPS_DATA);

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


  const vesselData = useMemo(() => {
    if (!Array.isArray(tripsData)) return [];

    return tripsData.map((trip) => {
      const departureDate = new Date(trip.tripStartDate);
      const arrivalDate = new Date(trip.tripEndDate);
      const durationMs = arrivalDate - departureDate;
      const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      return {
        vesselName: i18n.language === 'en' ? trip.vesselEnglishName : trip.vesselArabName,
        price: "$230.00",
        departureDate: formatDate(departureDate),
        departureTime: formatTime(departureDate),
        arrivalDate: formatDate(arrivalDate),
        arrivalTime: formatTime(arrivalDate),
        shipIcon: require('../../assets/images/icons/ship-icon.png'),
        duration: `Est. ${days}d ${hours}h`,
        tripSerial: trip.tripSerial,
        tripName: trip.tripName,
      };
    });
  }, [tripsData, i18n.language]);

  const totalPassengers = passengers.adult + passengers.child + passengers.infant;
  const passengerText = `${totalPassengers} ${t(totalPassengers > 1 ? 'booking.passengers_plural' : 'booking.passenger')}`;

  const dateOptions = useMemo(() => generateDateOptions(selectedDate, i18n.language), [selectedDate, i18n.language]);

  const handleTicketPress = (vessel) => {
    router.push({
      pathname: "/vessel-details",
      params: { ...vessel, fromPort, toPort },
    });
  };

  const handleDateSelect = async (dateOption) => {
    if (dateOption.isSelected || isLoadingTrips) return;

    setIsLoadingTrips(true);
    setSelectedDate(dateOption.fullDate);
    
    setTimeout(() => {
      setTripsData(STATIC_TRIPS_DATA);
      setIsLoadingTrips(false);
    }, 500); 
  };

  const styles = getStyles(isRTL);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require('../../assets/images/icons/back-arrow.png')}
            style={[styles.backArrowIcon, isRTL && { transform: [{ scaleX: -1 }] }]}
          />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>{t('searchResults.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.blueSection}>
          <View style={styles.headerContainer}>
              <View style={styles.portInfoContainer}>
                  <Text style={styles.portName} numberOfLines={2}>{fromPort}</Text>
                  <Image
                    source={require('../../assets/images/icons/ferry-route.png')}
                    style={[styles.ferryRouteIcon, isRTL && { transform: [{ scaleX: -1 }] }]}
                  />
                  <Text style={styles.portName} numberOfLines={2}>{toPort}</Text>
              </View>
              <Text style={styles.passengerInfo}>{`${passengerText} • ${travelClass}`}</Text>
          </View>

          <View style={styles.dateSelectionContainer}>
            <TouchableOpacity style={styles.calendarIconContainer}>
              <Image
                source={require('../../assets/images/icons/calendar2.png')}
                style={styles.calendarIcon}
              />
            </TouchableOpacity>
            <FlatList
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
                      <Text style={styles.vesselName}>{vessel.vesselName}</Text>
                      <View>
                        <Text style={styles.estPriceLabel}>{t('searchResults.estPrice')}</Text>
                        <Text>
                          <Text style={styles.price}>{vessel.price}</Text>
                          <Text style={styles.paxText}>{t('searchResults.pax')}</Text>
                        </Text>
                      </View>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.vesselDetailsContainer}>
                      <View style={styles.portDetailColumn}>
                        <View style={styles.badge}>
                          <Image source={require('../../assets/images/icons/from-icon.png')} style={styles.badgeIcon}/>
                          <Text style={styles.badgeText}>{t('searchResults.departure')}</Text>
                        </View>
                        <Text style={styles.portNameDetail}>{fromPort}</Text>
                        <Text style={styles.dateTimeText}>{vessel.departureDate}</Text>
                        <Text style={styles.dateTimeText}>{vessel.departureTime}</Text>
                      </View>

                      <View style={styles.routeColumn}>
                        <Image source={vessel.shipIcon} style={styles.shipIcon} />
                        <Text style={styles.durationText}>{vessel.duration}</Text>
                      </View>

                      <View style={styles.portDetailColumn}>
                        <View style={styles.badgeRight}>
                          <Image source={require('../../assets/images/icons/to-icon.png')} style={styles.badgeIcon}/>
                          <Text style={styles.badgeText}>{t('searchResults.arrival')}</Text>
                        </View>
                        <Text style={styles.portNameDetailRight}>{toPort}</Text>
                        <Text style={styles.dateTimeTextRight}>{vessel.arrivalDate}</Text>
                        <Text style={styles.dateTimeTextRight}>{vessel.arrivalTime}</Text>
                      </View>
                    </View>
                  </TicketWidget>
                </TouchableOpacity>
              ))
            ) : (
                <Text>No trips available for the selected date.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.navItem, item.isActive && styles.navItemActive]}
          >
            <Image
              source={item.icon}
              style={[styles.navIcon, item.isActive && styles.navIconActive]}
            />
            <Text style={[styles.navLabel, item.isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const getStyles = (isRTL) => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: 'white',
    },
    screenHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 20,
      backgroundColor: 'white',
      borderBottomColor: '#f0f0f0',
      gap: 100,
    },
    backArrowIcon: {
      width: 34,
      height: 34,
    },
    screenTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: 'black',
      textAlign: isRTL ? 'right' : 'left',
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    blueSection: {
      backgroundColor: '#ECF3FF',
    },
    headerContainer: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 24,
      gap: 24,
    },
    portInfoContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    portName: {
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold',
      color: 'black',
      fontSize: 16,
      flex: 1,
      textAlign: 'center',
    },
    ferryRouteIcon: {
      width: 80,
      height: 37,
      resizeMode: 'contain',
      marginHorizontal: 8,
    },
    passengerInfo: {
      fontFamily: 'Inter-Medium',
      fontWeight: '600',
      color: '#000000ff',
      fontSize: 16,
      paddingVertical: 2,
      textAlign: isRTL ? 'right' : 'left',
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
    },
    calendarIcon: {
        width: 23.6,
        height: 26.5,
        tintColor: 'white',
    },
    dateButton: {
      width: 73,
      height: 73,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: 'white',
      marginEnd: isRTL ? 0 : 12,
      marginStart: isRTL ? 12 : 0,
    },
    selectedDateButton: {
      backgroundColor: '#BAD4FF',
    },
    dayText: {
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold',
      fontSize: 13,
      color: '#B6BDCF',
      marginBottom: 4,
    },
    selectedDayText: {
      color: '#6291E8',
    },
    dateText: {
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold',
      fontSize: 16,
      color: 'black',
    },
    selectedDateText: {
      color: '#092863',
    },
    whiteSection: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    availableVesselsHeader: {
        fontFamily: 'Inter-Bold',
        fontWeight: 'bold',
        fontSize: 18,
        color: '#092863aa',
        alignSelf: isRTL ? 'flex-end' : 'flex-start',
        marginBottom: 20,
    },
    vesselListContainer: {
      paddingTop: 32,
      paddingHorizontal: 24,
      paddingBottom: 120,
    },
    vesselCardHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    vesselName: {
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold',
      fontSize: 18,
      color: 'black',
      textAlign: isRTL ? 'right' : 'left',
    },
    estPriceLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 15,
      color: '#7E92B9',
      textAlign: isRTL ? 'left' : 'right',
    },
    price: {
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold',
      color: '#6291E8',
      fontSize: 18,
    },
    paxText: {
      fontSize: 16,
      color: 'black',
    },
    separator: {
      height: 1,
      backgroundColor: '#e7e5e5ff',
      marginVertical: 16,
    },
    vesselDetailsContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
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
});

export default SearchResultsScreen;