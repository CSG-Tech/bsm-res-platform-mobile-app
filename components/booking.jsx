import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PassengerSelectionModal } from '../components/PassengerSelectionModal';

// Mock Data
const PORTS = [
  { id: '1', name: 'Jeddah Islamic Port' },
  { id: '2', name: 'King Abdullah Port' },
  { id: '3', name: 'Dammam Port' },
  { id: '4', name: 'Jubail Commercial Port' },
];

const CLASSES = [
  { id: '1', name: 'Economy' },
  { id: '2', name: 'Business' },
  { id: '3', name: 'First Class' },
];

const navigationItems = [
  {
    icon: 'home',
    label: 'Home',
    isActive: true,
  },
  {
    icon: 'ticket-alt',
    label: 'Tickets',
    isActive: false,
  },
  {
    icon: 'users',
    label: 'Manage',
    isActive: false,
  },
];

const BookingScreen = () => {
  const [tripType, setTripType] = useState('One-Way');
  const [fromPort, setFromPort] = useState(null);
  const [toPort, setToPort] = useState(null);
  const [travelDate, setTravelDate] = useState(new Date());
  const [passengers, setPassengers] = useState({ adult: 1, child: 0, infant: 0 });
  const [isPassengerModalVisible, setPassengerModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isPortModalVisible, setPortModalVisible] = useState(false);
  const [isClassModalVisible, setClassModalVisible] = useState(false);
  const [portSelectorMode, setPortSelectorMode] = useState('from');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const totalPassengers = passengers.adult + passengers.child + passengers.infant;

  const handleSwitchPorts = () => {
    const temp = fromPort;
    setFromPort(toPort);
    setToPort(temp);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || travelDate;
    setShowDatePicker(Platform.OS === 'ios');
    setTravelDate(currentDate);
  };

  const handleSearch = () => {
    const searchDetails = {
      tripType,
      from: fromPort?.name,
      to: toPort?.name,
      date: travelDate.toLocaleDateString(),
      passengers,
      class: selectedClass?.name,
    };
    alert(`Searching with details:\n${JSON.stringify(searchDetails, null, 2)}`);
  };

  const openPortSelector = (mode) => {
    setPortSelectorMode(mode);
    setPortModalVisible(true);
  };

  const openClassSelector = () => {
    setClassModalVisible(true);
  };

  const DropdownItem = ({ item, onPress }) => (
    <TouchableOpacity style={styles.modalItem} onPress={onPress}>
      <Text style={styles.modalItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <Image
        source={require('../assets/images/background.png')}
        style={styles.topBackgroundImage}
      />
      
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>
            Let's book{'\n'} 
            your next trip
        </Text>
        <View style={styles.rightHeaderItems}>
            <View style={styles.languageContainer}>
                <Text style={styles.languageText}>
                    <Text style={{ fontWeight: 'bold' }}>EN</Text> | AR
                </Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
                <Image
                source={require('../assets/images/notifications.png')}
                style={styles.notificationIcon}
                />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[styles.toggleButton, tripType === 'One-Way' && styles.toggleButtonActive]}
              onPress={() => setTripType('One-Way')}>
              <Text style={[styles.toggleButtonText, tripType === 'One-Way' && styles.toggleButtonTextActive]}>One-Way</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, tripType === 'Round Trip' && styles.toggleButtonActive]}
              onPress={() => setTripType('Round Trip')}>
              <Text style={[styles.toggleButtonText, tripType === 'Round Trip' && styles.toggleButtonTextActive]}>Round Trip</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputFieldContainer}>
            <TouchableOpacity style={styles.inputButton} onPress={() => openPortSelector('from')}>
              <Image source={require('../assets/images/from-icon.png')} style={styles.inputIcon} />
              <Text style={styles.placeholderText}>{fromPort ? fromPort.name : 'Select Port'}</Text>
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>From</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputFieldContainer}>
            <TouchableOpacity style={styles.inputButton} onPress={() => openPortSelector('to')}>
              <Image source={require('../assets/images/to-icon.png')} style={styles.inputIcon} />
              <Text style={styles.placeholderText}>{toPort ? toPort.name : 'Select Port'}</Text>
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>To</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.swapButton} onPress={handleSwitchPorts}>
            <Image source={require('../assets/images/swap-icon.png')} style={styles.swapIcon} />
          </TouchableOpacity>

          <View style={styles.inputFieldContainer}>
            <TouchableOpacity style={styles.inputButton} onPress={() => setShowDatePicker(true)}>
              <Image source={require('../assets/images/calendar-icon.png')} style={styles.inputIcon} />
              <Text style={styles.placeholderText}>{travelDate.toLocaleDateString()}</Text>
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Travel Date</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <View style={[styles.inputFieldContainer, { flex: 1, marginRight: 8 }]}>
              <TouchableOpacity style={styles.inputButton} onPress={() => setPassengerModalVisible(true)}>
                <Image source={require('../assets/images/passengers-icon.png')} style={styles.inputIcon} />
                <Text style={styles.placeholderText}>
                  {totalPassengers} Passenger{totalPassengers > 1 ? 's' : ''}
                </Text>
                <View style={styles.labelContainer}>
                  <Text style={styles.labelText}>Passengers</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputFieldContainer, { flex: 1, marginLeft: 8 }]}>
              <TouchableOpacity style={styles.inputButton} onPress={openClassSelector}>
                <Image source={require('../assets/images/class-icon.png')} style={styles.inputIcon} />
                <Text style={styles.placeholderText}>{selectedClass ? selectedClass.name : 'Select'}</Text>
                <View style={styles.labelContainer}>
                  <Text style={styles.labelText}>Class</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.navItem, item.isActive && styles.navItemActive]}
          >
            <FontAwesome5
              name={item.icon}
              size={24}
              color={item.isActive ? '#092863' : '#878d9a'}
            />
            <Text
              style={[styles.navLabel, item.isActive && styles.navLabelActive]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={isPortModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Port</Text>
            <FlatList
              data={PORTS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DropdownItem
                  item={item}
                  onPress={() => {
                    if (portSelectorMode === 'from') setFromPort(item);
                    else setToPort(item);
                    setPortModalVisible(false);
                  }}
                />
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setPortModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isClassModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Class</Text>
            <FlatList
              data={CLASSES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DropdownItem
                  item={item}
                  onPress={() => {
                    setSelectedClass(item);
                    setClassModalVisible(false);
                  }}
                />
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setClassModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={travelDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onDateChange}
        />
      )}

      <PassengerSelectionModal
        visible={isPassengerModalVisible}
        onClose={() => setPassengerModalVisible(false)}
        onConfirm={(newCounts) => {
            setPassengers(newCounts);
            setPassengerModalVisible(false);
        }}
        initialCounts={passengers}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#EBF2FF', 
    },
    topBackgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      width: 420,
      height: 350 
    },
    headerContent: {
        paddingTop: 100, 
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
    },
    headerTitle: {
      flex: 1, 
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold',
      color: 'white',
      fontSize: 38, 
    },
    rightHeaderItems: {
        alignItems: 'flex-end',
    },
    languageContainer: {
        marginBottom: 8, 
    },
    languageText: {
        fontFamily: 'Inter-Regular',
        color: 'white',
        fontSize: 16,
    },
    notificationButton: {
      padding: 0,
    },
    notificationIcon: {
      width: 48,
      height: 48,
    },
    scrollContent: {
      paddingTop: 50,
      paddingBottom: 100,
    },
    card: {
      marginHorizontal: 24,
      backgroundColor: 'white',
      borderRadius: 24,
      padding: 24,
      shadowColor: '#becde6',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.5,
      shadowRadius: 52.4,
      elevation: 5,
    },
    toggleGroup: {
      flexDirection: 'row',
      height: 56,
      backgroundColor: 'white',
      borderRadius: 64,
      borderWidth: 1,
      borderColor: '#878d9a',
      padding: 4,
      marginBottom: 24,
    },
    toggleButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 64,
    },
    toggleButtonActive: {
      backgroundColor: '#6291e8',
    },
    toggleButtonText: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: '#1e1e1e',
    },
    toggleButtonTextActive: {
      color: 'white',
    },
    inputFieldContainer: {
        marginBottom: 24,
    },
    inputButton: {
        flexDirection: 'row',
        height: 56,
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 24,
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#878d9a',
    },
    inputIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },
    placeholderText: {
        flex: 1,
        fontFamily: 'Inter-Regular',
        color: '#878d9a',
        fontSize: 14,
    },
    labelContainer: {
        position: 'absolute',
        top: -12,
        left: 14,
        backgroundColor: 'white',
        paddingHorizontal: 8,
    },
    labelText: {
        fontFamily: 'Inter-Regular',
        color: '#4e4e4e',
        fontSize: 14,
    },
    swapButton: {
        position: 'absolute',
        top: 131,
        right: 24,
        width: 70,
        height: 64,
        borderRadius: 52,
        backgroundColor: '#6291e8',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 10,
    },
    swapIcon: {
        width: 116,
        height: 116,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    searchButton: {
        height: 56,
        backgroundColor: '#06193b',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#c0d0ec',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 5,
    },
    searchButtonText: {
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold',
      color: 'white',
      fontSize: 14,
    },
    navigation: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        height: 95,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 48,
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#d8e4f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 15.9,
        elevation: 5,
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
        padding: 12,
        borderRadius: 16,
    },
    navItemActive: {
        backgroundColor: '#ecf1f9',
        marginTop: -10,
        marginBottom: -10,
    },
    navLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#878d9a',
    },
    navLabelActive: {
        fontWeight: 'bold',
        color: '#092863',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: 'white',
      width: '85%',
      borderRadius: 15,
      padding: 20,
      maxHeight: '70%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    modalItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    modalItemText: {
      fontSize: 16,
    },
    closeButton: {
      marginTop: 20,
      padding: 15,
      backgroundColor: '#0A2351',
      borderRadius: 10,
      alignItems: 'center',
    },
    closeButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
});

export default BookingScreen;