import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  I18nManager,
} from 'react-native';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import RNRestart from 'react-native-restart';
import { Calendar } from 'react-native-calendars';
import { PassengerSelectionModal } from './PassengerSelectionModal';


const CustomDay = ({ date, state, marking, onPress }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const dayText = isArabic ? convertToArabicNumerals(date.day) : date.day;

  const containerStyle = [
    { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    marking?.selected && { backgroundColor: '#6291e8', borderRadius: 16 }
  ];
  const textStyle = [
    { fontSize: 16, color: '#1e1e1e' },
    state === 'disabled' && { color: '#d9e1e8' },
    state === 'today' && !marking?.selected && { color: '#6291e8', fontWeight: 'bold' },
    marking?.selected && { color: 'white', fontWeight: 'bold' }
  ];

  return (
    <TouchableOpacity onPress={() => onPress(date)} style={containerStyle}>
      <Text style={textStyle}>
        {dayText}
      </Text>
    </TouchableOpacity>
  );
};
const convertToArabicNumerals = (number) => {
  if (number === undefined || number === null) return '';
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(number).replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
};
const PORTS = [{ id: '1', name: 'Jeddah Islamic Port' }, { id: '2', name: 'King Abdullah Port' }, { id: '3', name: 'Dammam Port' }];

const getStyles = (isRTL) => {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#EBF2FF' },
    topBackgroundImage: { position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 350 },
    headerContent: { paddingTop: 100, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { flex: 1, fontFamily: 'Inter-Bold', fontWeight: 'bold', color: 'white', fontSize: 38, textAlign: isRTL ? 'left' : 'left' },
    rightHeaderItems: { alignItems: 'flex-end' },
    languageContainer: { marginBottom: 8 },
    languageText: { fontFamily: 'Inter-Regular', color: 'white', fontSize: 16 },
    notificationButton: { padding: 0 },
    notificationIcon: { width: 48, height: 48 },
    scrollContent: { paddingTop: 50, paddingBottom: 100 },
    card: { marginHorizontal: 24, backgroundColor: 'white', borderRadius: 24, padding: 24, elevation: 5 },
    toggleGroup: { flexDirection: isRTL ? 'row-reverse' : 'row', height: 56, backgroundColor: 'white', borderRadius: 64, borderWidth: 1, borderColor: '#878d9a', padding: 4, marginBottom: 24 },
    toggleButton: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 64 },
    toggleButtonActive: { backgroundColor: '#6291e8' },
    toggleButtonText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#1e1e1e' },
    toggleButtonTextActive: { color: 'white' },
    inputFieldContainer: { marginBottom: 24 },
    inputButton: { flexDirection: 'row', height: 56, alignItems: 'center', gap: 12, paddingHorizontal: 24, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#878d9a' },
    inputIcon: { width: 16, height: 16, resizeMode: 'contain' },
    placeholderText: { flex: 1, fontFamily: 'Inter-Regular', color: '#878d9a', fontSize: 14, textAlign: isRTL ? 'left' : 'left' },
    valueText: { flex: 1, fontFamily: 'Inter-SemiBold', fontWeight: '600', color: '#1e1e1e', fontSize: 14, textAlign: isRTL ? 'left' : 'left' },
    labelContainer: { position: 'absolute', top: -12, backgroundColor: 'white', paddingHorizontal: 8, left: isRTL ? undefined : 14, left: isRTL ? 14 : undefined },
    labelText: { fontFamily: 'Inter-Regular', color: '#4e4e1e', fontSize: 14 },
    row: { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 16, marginBottom: 24 },
    rowItem: { flex: 1 },
    swapButton: { position: 'absolute', top: 131, width: 70, height: 64, borderRadius: 52, backgroundColor: '#6291e8', justifyContent: 'center', alignItems: 'center', zIndex: 10, left: isRTL ? 264 : undefined, right: isRTL ? undefined : 24 },
    swapIcon: { width: 116, height: 116 },
    searchButton: { height: 56, backgroundColor: '#06193b', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
    searchButtonText: { fontFamily: 'Inter-Bold', fontWeight: 'bold', color: 'white', fontSize: 14 },
    navigation: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: isRTL ? 'row-reverse' : 'row', height: 95, justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 48, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 5 },
    navItem: { alignItems: 'center', gap: 4, padding: 12, borderRadius: 16 },
    navIcon: { width: 26, height: 22, tintColor: '#878d9a' },
    navIconActive: { tintColor: '#092863' },
    navItemActive: { backgroundColor: '#ecf1f9', marginTop: -10, marginBottom: -10 },
    navLabel: { fontFamily: 'Inter-Regular', fontSize: 12, fontWeight: 'bold', color: '#878d9a' },
    navLabelActive: { fontWeight: 'bold', color: '#092863' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    genericModalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 15, padding: 20, alignSelf: 'center', maxHeight: '70%' },
    genericModalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalItemText: { fontSize: 16, textAlign: isRTL ? 'right' : 'left' },
    closeButton: { marginTop: 20, padding: 15, backgroundColor: '#0A2351', borderRadius: 10, alignItems: 'center' },
    closeButtonText: { color: 'white', fontWeight: 'bold' },
  });
};

const ListSelectionModal = ({ visible, onClose, data, onSelect, title, isRTL }) => {
  const styles = getStyles(isRTL);
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.genericModalContainer}>
          <Text style={styles.genericModalTitle}>{title}</Text>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                <Text style={styles.modalItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const CalendarModal = ({ visible, onClose, onSelect, selectedDate, title, isRTL }) => {
    const styles = getStyles(isRTL);
    const calendarTheme = {
        backgroundColor: '#ffffff', calendarBackground: '#ffffff', textSectionTitleColor: '#1e1e1e',
        selectedDayBackgroundColor: '#6291e8', selectedDayTextColor: '#ffffff', todayTextColor: '#6291e8',
        dayTextColor: '#1e1e1e', textDisabledColor: '#d9e1e8', arrowColor: '#6291e8',
        monthTextColor: '#06193b', textDayFontFamily: 'Inter-Regular', textMonthFontFamily: 'Inter-Bold',
        textDayHeaderFontFamily: 'Inter-Regular', textMonthFontSize: 18,
    };
    const markedDate = selectedDate ? { [selectedDate.toISOString().split('T')[0]]: { selected: true } } : {};

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.genericModalContainer}>
                    <Text style={styles.genericModalTitle}>{title}</Text>
                    <Calendar
                        onDayPress={onSelect}
                        markedDates={markedDate}
                        theme={calendarTheme}
                        dayComponent={CustomDay} 
                    />
                     <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};


const BookingScreen = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter(); 
  const isRTL = I18nManager.isRTL;
  const styles = getStyles(isRTL);
  const CLASSES = [
    { id: '1', name: t('booking.classEconomy') },
    { id: '2', name: t('booking.classBusiness') },
    { id: '3', name: t('booking.classFirst') }
  ];
  const navigationItems = [
    { icon: require('../assets/images/Home.png'), label: t('navigation.home'), isActive: true },
    { icon: require('../assets/images/Tickets.png'), label: t('navigation.tickets'), isActive: false },
    { icon: require('../assets/images/Manage.png'), label: t('navigation.manage'), isActive: false },
  ];
   
  const [tripType, setTripType] = useState('One-Way');
  const [fromPort, setFromPort] = useState(null);
  const [toPort, setToPort] = useState(null);
  const [travelDate, setTravelDate] = useState(new Date());
  const [passengers, setPassengers] = useState({ adult: 1, child: 0, infant: 0 });
  const [selectedClass, setSelectedClass] = useState(null);
  const [isPortModalVisible, setPortModalVisible] = useState(false);
  const [portSelectorMode, setPortSelectorMode] = useState('from');
  const [isClassModalVisible, setClassModalVisible] = useState(false);
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [isPassengerModalVisible, setPassengerModalVisible] = useState(false);

  const totalPassengers = passengers.adult + passengers.child + passengers.infant;
  const handleSearch = () => {
    if (!fromPort || !toPort || !travelDate || !selectedClass) {
      Alert.alert(
        t('booking.missingInfo'),
        t('booking.missingInfoMessage')
      );
      return; 
    }
  const totalPassengers = passengers.adult + passengers.child + passengers.infant;

   const params = {
      fromPort: fromPort.name,
      toPort: toPort.name,
      travelDate: travelDate.toISOString(), 
      passengers: JSON.stringify(passengers), 
      travelClass: selectedClass.name,
    };

    router.push({
      pathname: '/search-results',
      params: params,
    });
  };
  const changeLanguage = async (lang) => {
    if (lang === i18n.language) return;
    try {
      await AsyncStorage.setItem('user-language', lang);
      I18nManager.forceRTL(lang === 'ar');
      RNRestart.Restart();
    } catch (e) {
      console.error("Failed to change language", e);
    }
  };

  const handleSwitchPorts = () => {
    setFromPort(toPort);
    setToPort(fromPort);
  };

  const openPortSelector = (mode) => {
    setPortSelectorMode(mode);
    setPortModalVisible(true);
  };

  const handlePortSelect = (port) => {
    if (portSelectorMode === 'from') setFromPort(port);
    else setToPort(port);
    setPortModalVisible(false);
  };

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    setClassModalVisible(false);
  };

  const handleDateSelect = (day) => {
    setTravelDate(new Date(day.dateString));
    setCalendarModalVisible(false);
  };

  const handlePassengerConfirm = (newCounts) => {
    setPassengers(newCounts);
    setPassengerModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Image source={require('../assets/images/background.png')} style={styles.topBackgroundImage} />

      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{t('booking.title')}</Text>
        <View style={styles.rightHeaderItems}>
          <TouchableOpacity onPress={() => changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}>
            <View style={styles.languageContainer}>
              <Text style={styles.languageText}>
                <Text style={{ fontWeight: i18n.language === 'en' ? 'bold' : 'normal' }}>EN</Text> | <Text style={{ fontWeight: i18n.language === 'ar' ? 'bold' : 'normal' }}>AR</Text>
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Image source={require('../assets/images/notifications.png')} style={styles.notificationIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.toggleGroup}>
            <TouchableOpacity style={[styles.toggleButton, tripType === 'One-Way' && styles.toggleButtonActive]} onPress={() => setTripType('One-Way')}>
              <Text style={[styles.toggleButtonText, tripType === 'One-Way' && styles.toggleButtonTextActive]}>{t('booking.oneWay')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleButton, tripType === 'Round Trip' && styles.toggleButtonActive]} onPress={() => setTripType('Round Trip')}>
              <Text style={[styles.toggleButtonText, tripType === 'Round Trip' && styles.toggleButtonTextActive]}>{t('booking.roundTrip')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => openPortSelector('from')} style={styles.inputFieldContainer}>
            <View style={styles.inputButton}>
              <Image source={require('../assets/images/from-icon.png')} style={styles.inputIcon} />
              <Text style={fromPort ? styles.valueText : styles.placeholderText}>{fromPort ? fromPort.name : t('booking.selectPort')}</Text>
              <View style={styles.labelContainer}><Text style={styles.labelText}>{t('booking.from')}</Text></View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openPortSelector('to')} style={styles.inputFieldContainer}>
            <View style={styles.inputButton}>
              <Image source={require('../assets/images/to-icon.png')} style={styles.inputIcon} />
              <Text style={toPort ? styles.valueText : styles.placeholderText}>{toPort ? toPort.name : t('booking.selectPort')}</Text>
              <View style={styles.labelContainer}><Text style={styles.labelText}>{t('booking.to')}</Text></View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.swapButton} onPress={handleSwitchPorts}>
            <Image source={require('../assets/images/swap-icon.png')} style={styles.swapIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setCalendarModalVisible(true)} style={styles.inputFieldContainer}>
            <View style={styles.inputButton}>
              <Image source={require('../assets/images/calendar-icon.png')} style={styles.inputIcon} />
              <Text style={styles.valueText}>{travelDate.toLocaleDateString()}</Text>
              <View style={styles.labelContainer}><Text style={styles.labelText}>{t('booking.travelDate')}</Text></View>
            </View>
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <TouchableOpacity onPress={() => setPassengerModalVisible(true)}>
                <View style={styles.inputButton}>
                  <Image source={require('../assets/images/passengers-icon.png')} style={styles.inputIcon} />
                  <Text style={styles.valueText}>{totalPassengers} {t(totalPassengers > 1 ? 'booking.passengers_plural' : 'booking.passenger')}</Text>
                  <View style={styles.labelContainer}><Text style={styles.labelText}>{t('booking.passengers')}</Text></View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.rowItem}>
              <TouchableOpacity onPress={() => setClassModalVisible(true)}>
                <View style={styles.inputButton}>
                  <Image source={require('../assets/images/class-icon.png')} style={styles.inputIcon} />
                  <Text style={selectedClass ? styles.valueText : styles.placeholderText}>{selectedClass ? selectedClass.name : t('booking.select')}</Text>
                  <View style={styles.labelContainer}><Text style={styles.labelText}>{t('booking.class')}</Text></View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>{t('booking.search')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        {navigationItems.map((item) => (
          <TouchableOpacity key={item.label} style={[styles.navItem, item.isActive && styles.navItemActive]}>
            <Image source={item.icon} style={[styles.navIcon, item.isActive && styles.navIconActive]} />
            <Text style={[styles.navLabel, item.isActive && styles.navLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ListSelectionModal
        visible={isPortModalVisible}
        onClose={() => setPortModalVisible(false)}
        data={PORTS}
        onSelect={handlePortSelect}
        title={t('booking.selectPort')}
        isRTL={isRTL}
      />

      <ListSelectionModal
        visible={isClassModalVisible}
        onClose={() => setClassModalVisible(false)}
        data={CLASSES}
        onSelect={handleClassSelect}
        title={t('booking.class')}
        isRTL={isRTL}
      />

      <CalendarModal
        visible={isCalendarModalVisible}
        onClose={() => setCalendarModalVisible(false)}
        onSelect={handleDateSelect}
        selectedDate={travelDate}
        title={t('booking.pickDate')}
        isRTL={isRTL}
      />

      <PassengerSelectionModal
        visible={isPassengerModalVisible}
        onClose={() => setPassengerModalVisible(false)}
        onConfirm={handlePassengerConfirm}
        initialCounts={passengers}
      />
    </SafeAreaView>
  );
};

export default BookingScreen;