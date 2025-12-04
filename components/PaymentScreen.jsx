import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    I18nManager,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

// --- Static Data: Countries ---
const countries = [
  { id: 'eg', code: '+20', name: 'Egypt', flag: 'https://flagcdn.com/w40/eg.png' },
  { id: 'sa', code: '+966', name: 'Saudi Arabia', flag: 'https://flagcdn.com/w40/sa.png' },
  { id: 'ae', code: '+971', name: 'UAE', flag: 'https://flagcdn.com/w40/ae.png' },
  { id: 'sd', code: '+249', name: 'Sudan', flag: 'https://flagcdn.com/w40/sd.png' },
  { id: 'kw', code: '+965', name: 'Kuwait', flag: 'https://flagcdn.com/w40/kw.png' },
  { id: 'us', code: '+1', name: 'United States', flag: 'https://flagcdn.com/w40/us.png' },
  { id: 'uk', code: '+44', name: 'United Kingdom', flag: 'https://flagcdn.com/w40/gb.png' },
];


const FloatingLabelInput = ({ label, placeholder, value, onChangeText, keyboardType = 'default' }) => (
  <View style={styles.inputWrapper}>
    <Text style={[styles.floatingLabel, I18nManager.isRTL ? { right: 14 } : { left: 14 }]}>
      {label}
    </Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#b6bdcf"
      style={[styles.inputField, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

const CustomRadioButton = ({ selected, onPress, label }) => (
  <TouchableOpacity 
    style={styles.radioRow} 
    onPress={onPress} 
    activeOpacity={0.7}
  >
    <View style={styles.radioContainer}>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
);



const PaymentScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('card');
  
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); 
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0 });
  
   const params = useLocalSearchParams(); 
  const countryButtonRef = useRef(null);

  const handleOpenDropdown = () => {
    if (countryButtonRef.current) {
      countryButtonRef.current.measureInWindow((x, y, width, height) => {
        setDropdownLayout({
          x: x,
          y: y + height + 5, 
          width: width,
        });
        setDropdownVisible(true);
      });
    }
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
          <Text style={styles.headerTitle}>{t('payment.title')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Contact Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payment.contactDetails')}</Text>
            
            {/* Email Input */}
            <FloatingLabelInput 
              label={t('payment.email')} 
              placeholder={t('payment.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {/* Phone Row */}
            <View style={styles.phoneRow}>
              
              {/* Country Selector (Dropdown Trigger) */}
              <TouchableOpacity 
                ref={countryButtonRef}
                style={styles.countryContainer} 
                onPress={handleOpenDropdown}
                activeOpacity={0.7}
              >
                <Text style={[styles.floatingLabel, I18nManager.isRTL ? { right: 14 } : { left: 14 }]}>
                  {t('payment.country')}
                </Text>
                <View style={styles.countryContent}>
                  <Image 
                    source={{ uri: selectedCountry.flag }} 
                    style={styles.flagIcon} 
                  />
                  <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                  <ChevronDown size={16} color="#4e4e4e" />
                </View>
              </TouchableOpacity>

              {/* Phone Number Input */}
              <View style={{ flex: 1 }}>
                <FloatingLabelInput 
                  label={t('payment.phoneNumber')} 
                  placeholder={t('payment.phonePlaceholder')}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Payment Method Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payment.paymentMethod')}</Text>
            
            {/* Payment Logos Banner */}
            <View style={styles.paymentLogosContainer}>
               <Image 
                source={require('../assets/images/payment-methods.png')} 
                style={styles.paymentLogosImage}
                resizeMode="contain"
              />
            </View>

            {/* Radio Options */}
            <View style={styles.radioGroup}>
              <CustomRadioButton 
                label={t('payment.card')}
                selected={selectedPayment === 'card'}
                onPress={() => setSelectedPayment('card')}
              />
              <View style={styles.separator} />
              <CustomRadioButton 
                label={t('payment.reserve')}
                selected={selectedPayment === 'reserve'}
                onPress={() => setSelectedPayment('reserve')}
              />
            </View>
          </View>

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>{t('payment.total')}</Text>
            <Text style={styles.totalAmount}>{t('payment.currency')}250.00</Text>
          </View>

           <TouchableOpacity 
        style={styles.confirmButton} 
        onPress={() => {
          console.log('Confirmed');
          router.push({
            pathname: '/eticket', 
            params: { 
              passengerCount: params.passengerCount,
              passengersData: params.passengersData 
            } 
          });
        }}
      >
            <Text style={styles.confirmButtonText}>{t('payment.confirm')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.dropdownBox,
                {
                  top: dropdownLayout.y,
                  left: I18nManager.isRTL ? undefined : dropdownLayout.x,
                  right: I18nManager.isRTL ? (dropdownLayout.x) : undefined, 
                  left: dropdownLayout.x, 
                  width: 220, 
                },
              ]}
            >
              <FlatList
                data={countries}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      item.id === selectedCountry.id && styles.dropdownItemSelected,
                      { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }
                    ]}
                    onPress={() => {
                      setSelectedCountry(item);
                      setDropdownVisible(false);
                    }}
                  >
                    <View style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <Image source={{ uri: item.flag }} style={styles.flagIcon} />
                      <Text style={[
                        styles.dropdownItemText,
                        item.id === selectedCountry.id && styles.dropdownItemTextSelected
                      ]} numberOfLines={1}>
                        {item.name} ({item.code})
                      </Text>
                    </View>
                    {item.id === selectedCountry.id && (
                      <Check size={16} color="#06193b" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
    paddingBottom: 120, 
    gap: 12,
  },
  
  section: {
    backgroundColor: 'white',
    paddingVertical: 24,
    paddingHorizontal: 32, 
    marginBottom: 10,
    gap: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'left',
  },

  inputWrapper: {
    position: 'relative',
    height: 56, 
    borderWidth: 1,
    borderColor: '#b6bdcf',
    borderRadius: 16, 
    justifyContent: 'center',
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#4e4e4e',
    zIndex: 1,
  },
  inputField: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 24, 
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'black',
  },
  
  phoneRow: {
    flexDirection: 'row', 
    gap: 12,
    zIndex: 20, 
  },
  countryContainer: {
    width: 123,
    height: 56,
    borderWidth: 1,
    borderColor: '#b6bdcf',
    borderRadius: 16,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'white',
  },
  countryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  flagIcon: {
    width: 24,
    height: 16, 
    borderRadius: 2,
  },
  countryCode: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4e4e4e',
  },

  paymentLogosContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLogosImage: {
    width: '100%',
    height: '100%',
  },
  radioGroup: {
    gap: 4,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  radioContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b6bdcf',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#06193b', 
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#06193b',
  },
  radioLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: 'black',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingBottom: 34, 
    paddingHorizontal: 24,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 24,
    zIndex: 5,
  },
  totalContainer: {
    gap: 4,
  },
  totalLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  totalAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6291e8',
  },
  confirmButton: {
    backgroundColor: '#06193b',
    borderRadius: 16,
    height: 56,
    width: 200,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
  },
  dropdownBox: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f7ff',
  },
  dropdownItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#333',
  },
  dropdownItemTextSelected: {
    fontFamily: 'Inter-Medium',
    color: '#06193b',
  },
});

export default PaymentScreen;