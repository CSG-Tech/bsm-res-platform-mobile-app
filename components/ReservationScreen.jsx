import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  I18nManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronDown, Plus, X } from 'lucide-react-native';

const PassengerInformationSection = ({
  passengers,
  selectedPassengerId,
  onSelectPassenger,
  onAddPassenger,
  onRemovePassenger,
}) => (
  <View style={styles.sectionContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.passengerScroll} inverted={I18nManager.isRTL}>
      {passengers.map((passenger, index) => {
        const isSelected = selectedPassengerId === passenger.id;
        return (
          <TouchableOpacity
            key={passenger.id}
            onPress={() => onSelectPassenger(passenger.id)}
            style={[styles.passengerButton, isSelected ? styles.passengerButtonSelected : styles.passengerButtonDefault]}
          >
            {isSelected && index > 0 && (
              <TouchableOpacity
                style={styles.removePassengerIcon}
                onPress={(e) => { e.stopPropagation(); onRemovePassenger(passenger.id); }}
              >
                <X size={20} color="#000" />
              </TouchableOpacity>
            )}
            <Text style={styles.passengerButtonText}>{passenger.label}</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity style={styles.addPassengerButton} onPress={onAddPassenger}>
        <Plus size={24} color="#06193b" />
      </TouchableOpacity>
    </ScrollView>
  </View>
);

const TravelDetailsSection = ({ passengerDetails, onInputChange, t }) => {
  if (!passengerDetails) return null;

  return (
    <View style={styles.travelDetailsContainer}>
      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>{t('reservation.passengerInfo')}</Text>
        <View style={styles.inputRow}>
          <FloatingLabelInput label={t('reservation.firstName')} placeholder={t('reservation.enter')} value={passengerDetails.firstName} onChangeText={(text) => onInputChange('firstName', text)} />
          <FloatingLabelInput label={t('reservation.lastName')} placeholder={t('reservation.enter')} value={passengerDetails.lastName} onChangeText={(text) => onInputChange('lastName', text)} />
        </View>
        <FloatingLabelInput label={t('reservation.middleName')} placeholder={t('reservation.enter')} value={passengerDetails.middleName} onChangeText={(text) => onInputChange('middleName', text)} />
        <FloatingLabelSelect label={t('reservation.passengerType')} placeholder={t('reservation.select')} />
        <FloatingLabelSelect label={t('reservation.gender')} placeholder={t('reservation.select')} />
        <FloatingLabelInput label={t('reservation.birthdate')} placeholder="DD/MM/YYYY" />
      </View>
      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>{t('reservation.travelDetails')}</Text>
        <FloatingLabelInput label={t('reservation.nationality')} placeholder={t('reservation.enter')} />
        <FloatingLabelInput label={t('reservation.birthplace')} placeholder={t('reservation.enter')} />
        <FloatingLabelSelect label={t('reservation.class')} placeholder={t('reservation.select')} />
        <FloatingLabelSelect label={t('reservation.visaType')} placeholder={t('reservation.select')} />
      </View>
      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>{t('reservation.passportDetails')}</Text>
        <FloatingLabelInput label={t('reservation.passportNumber')} placeholder={t('reservation.enter')} />
        <FloatingLabelInput label={t('reservation.passportIssuingDate')} placeholder="DD/MM/YYYY" />
        <FloatingLabelInput label={t('reservation.passportExpirationDate')} placeholder="DD/MM/YYYY" />
      </View>
    </View>
  );
};

const createEmptyPassenger = (id) => ({ id, firstName: '', lastName: '', middleName: '' });

const ReservationScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [allPassengersDetails, setAllPassengersDetails] = useState([createEmptyPassenger(1)]);
  const [selectedPassengerId, setSelectedPassengerId] = useState(1);

  const handleAddPassenger = () => {
    const newId = allPassengersDetails.length > 0 ? Math.max(...allPassengersDetails.map(p => p.id)) + 1 : 1;
    setAllPassengersDetails([...allPassengersDetails, createEmptyPassenger(newId)]);
    setSelectedPassengerId(newId);
  };

  const handleRemovePassenger = (idToRemove) => {
    if (allPassengersDetails.length <= 1) return;
    const updatedPassengers = allPassengersDetails.filter(p => p.id !== idToRemove);
    setAllPassengersDetails(updatedPassengers);
    if (selectedPassengerId === idToRemove) {
      setSelectedPassengerId(updatedPassengers[0]?.id || null);
    }
  };

  const handleInputChange = (field, value) => {
    setAllPassengersDetails(currentDetails =>
      currentDetails.map(p => p.id === selectedPassengerId ? { ...p, [field]: value } : p)
    );
  };
  
  const passengerTabs = allPassengersDetails.map(p => ({ id: p.id, label: t('reservation.passengerLabel', { count: p.id }) }));
  const currentPassengerDetails = allPassengersDetails.find(p => p.id === selectedPassengerId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={30} color="#000" style={I18nManager.isRTL && { transform: [{ scaleX: -1 }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('reservation.headerTitle')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <PassengerInformationSection
            passengers={passengerTabs}
            selectedPassengerId={selectedPassengerId}
            onSelectPassenger={setSelectedPassengerId}
            onAddPassenger={handleAddPassenger}
            onRemovePassenger={handleRemovePassenger}
          />
          <TravelDetailsSection
            passengerDetails={currentPassengerDetails}
            onInputChange={handleInputChange}
            t={t}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton}>
            <Text style={styles.continueButtonText}>{t('reservation.continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const FloatingLabelInput = ({ label, placeholder, value, onChangeText }) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.inputLabel, I18nManager.isRTL ? { right: 14 } : { left: 14 }]}>{label}</Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#b6bdcf"
      style={[styles.textInput, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);
  
const FloatingLabelSelect = ({ label, placeholder }) => (
  <TouchableOpacity style={styles.inputContainer}>
    <Text style={[styles.inputLabel, I18nManager.isRTL ? { right: 14 } : { left: 14 }]}>{label}</Text>
    <View style={[styles.selectContent, { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}>
      <Text style={styles.selectPlaceholder}>{placeholder}</Text>
      <ChevronDown size={24} color="#5c7095" />
    </View>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fbfcff' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: 'white',
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
    paddingBottom: 120, 
    gap: 12,
  },
  sectionContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
  },
  passengerScroll: {
    paddingHorizontal: 26,
    alignItems: 'center',
    gap: 16,
  },
  passengerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 8,
    height: 70,
  },
  passengerButtonDefault: {
    backgroundColor: '#fbfcff',
  },
  passengerButtonSelected: {
    backgroundColor: '#edf3ff',
    borderWidth: 1,
    borderColor: '#6291e8',
  },
  removePassengerIcon: {
    marginRight: 12,
  },
  passengerButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'black',
  },
  addPassengerButton: {
    padding: 10,
  },
  travelDetailsContainer: {
    gap: 12,
  },
  formSection: {
    backgroundColor: 'white',
    paddingVertical: 24,
    paddingHorizontal: 32,
    gap: 25,
  },
  formSectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#5c7095',
    textAlign: I18nManager.isRTL ? 'right' : 'left',

  },
  inputRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    gap: 16,
  },
  inputContainer: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#b6bdcf',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  inputLabel: {
    position: 'absolute',
    top: -10,
    left: 14,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4e4e4e',
  },
  textInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'black',
    height: '100%',
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectPlaceholder: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#b6bdcf',
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
    color: 'white',
  },
});

export default ReservationScreen;