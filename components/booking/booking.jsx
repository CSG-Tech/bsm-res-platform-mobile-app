import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllClasses, getFromPorts, getToPorts, getTripsByDateAndLine, } from '../../axios/services/searchService';
import { PassengerSelectionModal } from './PassengerSelectionModal';
import * as Updates from 'expo-updates';
import NotificationIcon from '../../assets/images/icons/notifications.svg';
import HomeIcon from '../../assets/images/icons/Home.svg';
import TicketsIcon from '../../assets/images/icons/Tickets.svg';
import ManageIcon from '../../assets/images/icons/Manage.svg';
import SwapIcon from '../../assets/images/icons/swap-icon.svg';
import BackgroundImage from '../../assets/images/background/background.svg';
import FromIcon from '../../assets/images/icons/from-icon.svg';
import ToIcon from '../../assets/images/icons/to-icon.svg';
import CalendarIcon from '../../assets/images/icons/calendar-icon.svg';
import PassengersIcon from '../../assets/images/icons/passengers-icon.svg';
import ClassIcon from '../../assets/images/icons/class-icon.svg';



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
    switchLanguage: { paddingHorizontal: 16, paddingTop: 20, alignItems: isRTL ? 'flex-start' : 'flex-end' },
    headerContent: { paddingTop: 10, paddingHorizontal: 16, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' },
    headerTitle: { flex: 1, fontFamily: 'Inter-Bold', fontWeight: 'bold', color: 'white', fontSize: 32, textAlign: isRTL ? 'right' : 'left' },
    rightHeaderItems: { alignItems: 'flex-end' },
    languageContainer: { marginBottom: 8 },
    languageText: { fontFamily: 'Inter-Regular', color: 'white', fontSize: 16 },
    notificationButton: { padding: 0 },
    notificationIcon: { width: 48, height: 48 },
    card: { marginHorizontal: 15, backgroundColor: 'white', borderRadius: 24, padding: 10, marginTop: 20, elevation: 5 },
    toggleGroup: { flexDirection: isRTL ? 'row-reverse' : 'row', height: 56, backgroundColor: 'white', borderRadius: 64, borderWidth: 1, borderColor: '#878d9a', padding: 4, marginBottom: 24 },
    toggleButton: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 64 },
    toggleButtonActive: { backgroundColor: '#6291e8' },
    toggleButtonText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#1e1e1e' },
    toggleTextDisabled: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#d9e1e8' },
    toggleButtonTextActive: { color: 'white' },
    inputFieldContainer: { marginBottom: 17 },
    inputButton: { flexDirection: isRTL ? 'row-reverse' : 'row', height: 56, alignItems: 'center', gap: 12, paddingHorizontal: 24, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#878d9a' },
    inputIcon: { width: 16, height: 16, resizeMode: 'contain', flexShrink: 0 },
    placeholderText: { flex: 1, fontFamily: 'Inter-Regular', color: '#878d9a', fontSize: 14, textAlign: isRTL ? 'right' : 'left' },
    valueText: { flex: 1, fontFamily: 'Inter-SemiBold', fontWeight: '600', color: '#1e1e1e', fontSize: 14, textAlign: isRTL ? 'right' : 'left' },
    labelContainer: { position: 'absolute', top: -12, backgroundColor: 'white', paddingHorizontal: 8, left: isRTL ? undefined : 14, right: isRTL ? 14 : undefined, includeFontPadding: false, },
    labelText: { fontFamily: 'Inter-Regular', color: '#4e4e1e', fontSize: 14 },
    row: { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 16, marginBottom: 24 },
    rowItem: { flex: 1, minWidth: '48%' },
    swapButton: { position: 'absolute', top: 131, width: 70, height: 64, borderRadius: 52, backgroundColor: '#6291e8', justifyContent: 'center', alignItems: 'center', zIndex: 10, left: isRTL ? 24 : undefined, right: isRTL ? undefined : 24 },
    swapIcon: { width: 116, height: 116 },
    searchButton: { height: 56, backgroundColor: '#06193b', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 3 },
    searchButtonText: { fontFamily: 'Inter-Bold', fontWeight: 'bold', color: 'white', fontSize: 14 },
    navigation: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: isRTL ? 'row-reverse' : 'row', height: 95, justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 30, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 5 },
    navItem: { alignItems: 'center', gap: 4, padding: 12, borderRadius: 16 },
    navIcon: { width: 26, height: 22, tintColor: '#878d9a' },
    navIconActive: { tintColor: '#092863' },
    navItemActive: { backgroundColor: '#ecf1f9', marginTop: -10, marginBottom: -10 },
    navLabel: { fontFamily: 'Inter-Regular', fontSize: 12, fontWeight: 'bold', color: '#878d9a' },
    navLabelActive: { fontWeight: 'bold', color: '#092863' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    genericModalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 16, alignSelf: 'center', maxHeight: '70%' },
    genericModalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalItemText: { fontSize: 16, textAlign: isRTL ? 'right' : 'left' },
    closeButton: { marginTop: 10, paddingVertical: 14, backgroundColor: '#0A2351', borderRadius: 12, alignItems: 'center' },
    closeButtonText: { color: 'white', fontWeight: 'bold' },
    calendar: { borderRadius: 16 },
    calendarHeader: { paddingHorizontal: 16 },
    arrowWrapper: { width: 32,height: 32, justifyContent: 'center', alignItems: 'center', marginTop: -4},
    arrowText: {fontSize: 18,color: '#6291e8',fontWeight: 'bold'},
    calendarContainer: { marginBottom: 16}
  });
};

const ListSelectionModal = ({
  visible,
  onClose,
  data,
  onSelect,
  title,
  isRTL,
  isLoading,
  keyField = "id",
  labelFieldEn = "nameEn",
  labelFieldAr = "nameAr",
}) => {
  const styles = getStyles(isRTL);
  const { i18n } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.genericModalContainer}>
          <Text style={styles.genericModalTitle}>{title}</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#6291e8" />
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => String(item[keyField])}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                  <Text style={styles.modalItemText}>
                    {i18n.language === "en"
                      ? item[labelFieldEn] ?? ""
                      : item[labelFieldAr] ?? ""}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

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
  const markedDate = selectedDate ? { [selectedDate]: { selected: true } } : {};

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.genericModalContainer}>
          <Text style={styles.genericModalTitle}>{title}</Text>
          <View style={{maxHeight: 340}}>
            <Calendar
                monthFormat={'MMMM yyyy'}
                onDayPress={onSelect}
                markedDates={markedDate}
                theme={{...calendarTheme,arrowColor: '#6291e8',
                  'stylesheet.calendar.header': {
                    header: {
                      paddingHorizontal: 22,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 0,
                    },
                  },
                }}
                renderArrow={(direction) => (
                  <View style={styles.arrowWrapper}>
                    <Text style={styles.arrowText}>
                      {isRTL
                          ? direction === 'right' ? '>' : '<'   
                          : direction === 'left' ? '<' : '>'}  
                    </Text>
                  </View>
                )}
                style={styles.calendar}
              />
          </View>
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
  const isRTL = i18n.language === 'ar';
  const styles = getStyles(isRTL);
  const [isLoadingPorts, setIsLoadingPorts] = useState(false);
  const [fromPorts, setFromPorts] = useState([]);
  const [toPorts, setToPorts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoadingDegrees, setIsLoadingDegrees] = useState(false);

  const CLASSES = [
    { id: '1', name: t('booking.classEconomy') },
    { id: '2', name: t('booking.classBusiness') },
    { id: '3', name: t('booking.classFirst') }
  ];
  const navigationItems = [
    { icon: () => <HomeIcon style={styles.navIcon} />, label: t('navigation.home'), isActive: true },
    { icon: () => <TicketsIcon style={styles.navIcon} />, label: t('navigation.tickets'), isActive: false },
    { icon: () => <ManageIcon style={styles.navIcon} />, label: t('navigation.manage'), isActive: false },
  ];
  const [tripType, setTripType] = useState('One-Way');
  const [fromPort, setFromPort] = useState(null);
  const [toPort, setToPort] = useState(null);
  const [travelDate, setTravelDate] = useState();
  const [passengers, setPassengers] = useState({ adult: 1, child: 0, infant: 0 });
  const [selectedClass, setSelectedClass] = useState(null);
  const [isPortModalVisible, setPortModalVisible] = useState(false);
  const [portSelectorMode, setPortSelectorMode] = useState('from');
  const [isClassModalVisible, setClassModalVisible] = useState(false);
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [isPassengerModalVisible, setPassengerModalVisible] = useState(false);
  const filteredClasses = React.useMemo(() => {
    if (!classes || !Array.isArray(classes)) {
      return [];
    }

    if (i18n.language === 'en') {
      return classes.filter(cls => cls.classEnglishName);
    } else {
      return classes.filter(cls => cls.classArabName);
    }
  }, [classes, i18n.language]);

  useEffect(() => {
    const loadFromPorts = async () => {
      try {
        setIsLoadingPorts(true);
        const data = await getFromPorts();
        if (data && !Array.isArray(data)) {
          setFromPorts([data]);
        } else {
          setFromPorts(data || []);
        }
      } catch (error) {
        console.error('Error fetching from ports:', error);
        Alert.alert('Error', 'Could not load ports from the server.');
      } finally {
        setIsLoadingPorts(false);
      }
    };
    const loadAllDegrees = async () => {
      try {
        setIsLoadingDegrees(true);
        const response = await getAllClasses();
        if (response && response.data) {
          setClasses(response.data);
        } else {
          setClasses([]);
        }
      } catch (error) {
        console.error('Error fetching classs: ', error);
        Alert.alert('Error', 'Could not load classs from the server.');
      } finally {
        setIsLoadingDegrees(false);
      }
    }
    loadAllDegrees();
    loadFromPorts();
  }, []);

  const totalPassengers = passengers.adult + passengers.child + passengers.infant;
  const handleSearch = () => {
    if (!fromPort || !toPort || !travelDate || !selectedClass) {
      Alert.alert(
        t('booking.missingInfo'),
        t('booking.missingInfoMessage')
      );
      return;
    }

    const params = {
      lineCode: toPort?.lineCode,
      fromPort: i18n.language === 'en' ? fromPort.portEnglishName : fromPort.portArabName,
      toPort: i18n.language === 'en' ? toPort.portEnglishName : toPort.portArabName,
      travelDate: `${travelDate}T00:00:00.000Z`,
      passengers: JSON.stringify(passengers),
      travelClass: i18n.language === 'en' ? selectedClass.classEnglishName : selectedClass.classArabName,
      travelClassId: selectedClass.oracleClassId,
    };

    router.push({
      pathname: '/search-results',
      params: params,
    });
  };

  const changeLanguage = async (lang) => {
    if (lang === i18n.language) return;
    await i18n.changeLanguage(lang);
  };

  const handleSwitchPorts = () => {
    setFromPort(toPort);
    setToPort(fromPort);
  };

  const openPortSelector = (mode) => {
    setPortSelectorMode(mode);
    setPortModalVisible(true);
  };

  const handlePortSelect = async (port) => {
    if (portSelectorMode === 'from') {
      setFromPort(port);
      setToPort(null);

      try {
        setIsLoadingPorts(true);
        const response = await getToPorts(port.oraclePortCode);
        const toPortsData = response.data;

        if (toPortsData && !Array.isArray(toPortsData)) {
          setToPorts([toPortsData]);
        } else {
          setToPorts(toPortsData || []);
        }

      } catch (error) {
        console.error('Error fetching to ports:', error);
        Alert.alert('Error', 'Could not load destination ports.');
      } finally {
        setIsLoadingPorts(false);
      }
    } else {
      setToPort(port);
    }

    setPortModalVisible(false);
  };


  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    setClassModalVisible(false);
  };

  const handleDateSelect = (day) => {
    setTravelDate(day.dateString);
    setCalendarModalVisible(false);
  };

  const handlePassengerConfirm = (newCounts) => {
    setPassengers(newCounts);
    setPassengerModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <BackgroundImage style={styles.topBackgroundImage} />
      <View style={styles.switchLanguage}>
        <TouchableOpacity onPress={() => changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}>
          <View style={styles.languageContainer}>
            <Text style={styles.languageText}>
              <Text style={{ fontWeight: i18n.language === 'en' ? 'bold' : 'normal' }}>EN</Text> | <Text style={{ fontWeight: i18n.language === 'ar' ? 'bold' : 'normal' }}>AR</Text>
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{t('booking.title')}</Text>
        <View style={styles.rightHeaderItems} >

          <TouchableOpacity style={styles.notificationButton}>
            <NotificationIcon style={styles.notificationIcon} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1, paddingBottom: isPassengerModalVisible ? 0 : 110 }}>
        <View style={styles.card}>
          <View style={styles.toggleGroup}>
            <TouchableOpacity style={[styles.toggleButton, tripType === 'One-Way' && styles.toggleButtonActive]} onPress={() => setTripType('One-Way')}>
              <Text style={[styles.toggleButtonText, tripType === 'One-Way' && styles.toggleButtonTextActive]}>{t('booking.oneWay')}</Text>
            </TouchableOpacity>
            {/* change (Round Trip) to be disabled */}
            <TouchableOpacity style={[styles.toggleButton, tripType === 'Round Trip' && styles.toggleButtonDisabled]}>
              <Text style={[styles.toggleTextDisabled, tripType === 'Round Trip']}>{t('booking.roundTrip')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => openPortSelector('from')} style={styles.inputFieldContainer}>
            <View style={styles.inputButton}>
              <FromIcon style={styles.inputIcon} />
              {/* <Image source={require('../../assets/images/icons/from-icon.png')} style={styles.inputIcon} /> */}
              <Text style={fromPort ? styles.valueText : styles.placeholderText}>{fromPort ? i18n.language === 'en' ? fromPort.portEnglishName : fromPort.portArabName : t('booking.selectPort')}</Text>
              <View style={styles.labelContainer}><Text style={styles.labelText}>{t('booking.from')}</Text></View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openPortSelector('to')} style={styles.inputFieldContainer}>
            <View style={styles.inputButton}>
              <ToIcon style={styles.inputIcon} />
              {/* <Image source={require('../../assets/images/icons/to-icon.png')} style={styles.inputIcon} /> */}
              <Text style={toPort ? styles.valueText : styles.placeholderText}>{toPort ? i18n.language === 'en' ? toPort.portEnglishName : toPort.portArabName : t('booking.selectPort')}</Text>
              <View style={styles.labelContainer}><Text style={styles.labelText}>{t('booking.to')}</Text></View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.swapButton} onPress={handleSwitchPorts}>
            <SwapIcon style={styles.swapIcon} />
            {/* <Image source={require('../../assets/images/icons/swap-icon.png')} style={styles.swapIcon} /> */}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setCalendarModalVisible(true)} style={styles.inputFieldContainer}>
            <View style={styles.inputButton}>
              <CalendarIcon style={styles.inputIcon} />
              {/* <Image source={require('../../assets/images/icons/calendar-icon.png')} style={styles.inputIcon} /> */}
              <Text style={styles.valueText} numberOfLines={1}>
                {travelDate
                  ? (i18n.language === 'ar'
                    ? travelDate.split('-').map(d => convertToArabicNumerals(d)).join('-')
                    : travelDate)
                  : t('booking.select')}
              </Text>

              <View style={styles.labelContainer}><Text style={styles.labelText}>{t('booking.travelDate')}</Text></View>
            </View>
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <TouchableOpacity onPress={() => setPassengerModalVisible(true)}>
                <View style={styles.inputButton}>
                  <PassengersIcon style={styles.inputIcon} />
                  {/* <Image source={require('../../assets/images/icons/passengers-icon.png')} style={styles.inputIcon} /> */}
                  <Text style={styles.valueText} numberOfLines={1} >{totalPassengers} {t(totalPassengers > 1 ? 'booking.passengers_plural' : 'booking.passenger')}</Text>
                  <View style={styles.labelContainer}><Text style={styles.labelText}>{t('booking.passengers')}</Text></View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.rowItem}>
              <TouchableOpacity onPress={() => setClassModalVisible(true)}>
                <View style={styles.inputButton}>
                  <ClassIcon style={styles.inputIcon} />
                  {/* <Image source={require('../../assets/images/icons/class-icon.png')} style={styles.inputIcon} /> */}
                  <Text style={selectedClass ? styles.valueText : styles.placeholderText} numberOfLines={1} ellipsizeMode="tail">{selectedClass ? i18n.language == 'en' ? selectedClass.classEnglishName : selectedClass.classArabName : t('booking.select')}</Text>
                  <View style={styles.labelContainer}><Text style={styles.labelText}>{t('booking.class')}</Text></View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>{t('booking.search')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {!isPassengerModalVisible && (
        <View style={styles.navigation}>
          {navigationItems.map((item) => (
            <TouchableOpacity key={item.label} style={[styles.navItem, item.isActive && styles.navItemActive]}>
              {typeof item.icon === 'function' ? (
                item.icon()
              ) : (
                <Image source={item.icon} style={[styles.navIcon, item.isActive && styles.navIconActive]} />)}
              <Text style={[styles.navLabel, item.isActive && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <ListSelectionModal
        visible={isPortModalVisible}
        onClose={() => setPortModalVisible(false)}
        data={portSelectorMode === 'from' ? fromPorts : toPorts}
        onSelect={handlePortSelect}
        title={t('booking.selectPort')}
        isRTL={isRTL}
        isLoading={isLoadingPorts}
        keyField={"oraclePortCode"}
        labelFieldAr={"portArabName"}
        labelFieldEn={"portEnglishName"}

      />

      <ListSelectionModal
        visible={isClassModalVisible}
        onClose={() => setClassModalVisible(false)}
        data={filteredClasses}
        onSelect={handleClassSelect}
        title={t('booking.class')}
        isRTL={isRTL}
        keyField={"oracleClassId"}
        labelFieldAr={"classArabName"}
        labelFieldEn={"classEnglishName"}
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