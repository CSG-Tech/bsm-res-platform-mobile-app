import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, MoreHorizontal, Share2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  I18nManager,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const tripDetailsRaw = [
  { key: "tripNumber", value: "6" },
  { key: "tripDate", value: "16-11-2025" },
  { key: "vessel", value: "Amman" },
  { key: "nationality", value: "Sudanese" },
  { key: "degree", value: "Full Pullman +++" },
  { key: "route", value: "Jeddah - Suakin" },
  { key: "passportNumber", value: "P08069525" },
  { key: "reservationNumber", value: "1234567890123" },
];

const accordionItemsRaw = [
  "ins1", "ins2", "ins3", "ins4", "ins5"
];


const AccordionItem = ({ title }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity 
        style={styles.accordionHeader} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        {expanded ? <ChevronUp size={20} color="#000" /> : <ChevronDown size={20} color="#000" />}
      </TouchableOpacity>
      {expanded && (
        <View style={styles.accordionContent}>
          <Text style={styles.accordionText}>
            Perfume, Canned Sodas and Any Electronics.
          </Text>
        </View>
      )}
    </View>
  );
};

const TicketCard = ({ t, passengerName }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.passengerLabel}>{t('eticket.passengerNameLabel')}</Text>
            <Text style={styles.passengerName}>{passengerName}</Text>
          </View>
          
          <Image 
            source={require('../assets/images/Logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>

        <View style={styles.detailsContainer}>
          {tripDetailsRaw.map((item, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t(`eticket.${item.key}`)}</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.barcodeContainer}>
          <Image 
            source={require('../assets/images/linedot.png')} 
            style={styles.separatorLine} 
            resizeMode="stretch" 
          />
          
          <Image 
            source={require('../assets/images/barcode.png')} 
            style={styles.barcodeImage} 
            resizeMode="contain"
          />
        </View>

      </View>
      
      <View style={[styles.ticketNotch, styles.notchLeft]} />
      <View style={[styles.ticketNotch, styles.notchRight]} />
    </View>
  );
};


const ETicketScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  
  const [passengers, setPassengers] = useState([]);
  const [selectedPassengerIndex, setSelectedPassengerIndex] = useState(0);
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 24 });
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const loadPassengers = () => {
      if (params.passengersData) {
        try {
          const parsed = JSON.parse(params.passengersData);
          const formatted = parsed.map((p, i) => ({
            id: p.id || i,
            name: p.firstName ? `${p.firstName} ${p.lastName}` : `Passenger ${i + 1}`,
            label: t('eticket.passenger', { num: i + 1 })
          }));
          setPassengers(formatted);
        } catch (e) {
          generateDummyPassengers();
        }
      } else {
        generateDummyPassengers();
      }
    };

    loadPassengers();
  }, [params.passengersData, params.passengerCount]); 

  const generateDummyPassengers = () => {
    const count = params.passengerCount ? parseInt(params.passengerCount, 10) : 3;
    const dummy = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: i === 0 ? `Passenger ${i}` : `Passenger ${i + 1}`, 
      label: t('eticket.passenger', { num: i + 1 })
    }));
    setPassengers(dummy);
  };

  const handleMenuPress = () => {
    if (menuButtonRef.current) {
      menuButtonRef.current.measureInWindow((x, y, width, height) => {
        setMenuPosition({
          top: y + height + 5,
          right: 24, 
          left: I18nManager.isRTL ? 24 : undefined
        });
        setMenuVisible(true);
      });
    }
  };

  const currentPassengerName = passengers[selectedPassengerIndex]?.name || "Ahmed Ibrahim";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#edf3ff" />
      
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={28} color="#000" style={I18nManager.isRTL && { transform: [{ scaleX: -1 }] }} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{t('eticket.headerTitle')}</Text>
          
          <TouchableOpacity 
            ref={menuButtonRef}
            style={styles.iconButton} 
            onPress={handleMenuPress}
          >
            <MoreHorizontal size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          
          {/* Passenger Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.tabsScroll}
              inverted={I18nManager.isRTL}
            >
              {passengers.map((p, index) => {
                const isSelected = index === selectedPassengerIndex;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.tabButton,
                      isSelected ? styles.tabButtonActive : styles.tabButtonInactive
                    ]}
                    onPress={() => setSelectedPassengerIndex(index)}
                  >
                    <Text style={styles.tabText}>{p.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* E-Ticket Card */}
          <View style={styles.section}>
            <TicketCard t={t} passengerName={currentPassengerName} />
          </View>

          {/* Instructions Accordion */}
          <View style={styles.instructionsSection}>
            <Text style={styles.instructionsTitle}>{t('eticket.instructionsTitle')}</Text>
            <View style={styles.accordionContainer}>
              {accordionItemsRaw.map((itemKey, index) => (
                <AccordionItem key={index} title={t(`eticket.${itemKey}`)} />
              ))}
            </View>
          </View>

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.shareBtn}>
            <Share2 size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.downloadBtn}>
            <Text style={styles.downloadText}>{t('eticket.download')}</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Dropdown Menu Modal */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <View style={[
                styles.menuContainer, 
                { 
                  top: menuPosition.top, 
                  ...(I18nManager.isRTL ? { left: 24 } : { right: 24 }) 
                }
              ]}>
              <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <Text style={styles.menuText}>{t('eticket.viewTransaction')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <Text style={styles.menuText}>{t('eticket.changeDegree')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <Text style={styles.menuText}>{t('eticket.reschedule')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setMenuVisible(false)}>
                <Text style={[styles.menuText, styles.cancelText]}>{t('eticket.cancelBooking')}</Text>
              </TouchableOpacity>
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
    backgroundColor: '#edf3ff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#edf3ff',
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: 'black',
  },
  iconButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  
  // --- Tabs ---
  tabsContainer: {
    marginBottom: 30,
  },
  tabsScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  tabButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#cbdaf9',
    borderColor: '#6291e8',
  },
  tabButtonInactive: {
    backgroundColor: 'white',
    borderColor: '#e5e7eb',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'black',
  },

  // --- Ticket Card ---
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#9abdff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
    paddingBottom: 20, 
  },
  cardContent: {
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardHeaderLeft: {
    gap: 8,
  },
  passengerLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#888d9a',
    textAlign: 'left',
  },
  passengerName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'left',
  },
  logo: {
    width: 60,
    height: 60,
  },
  detailsContainer: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    fontWeight: 'bold',
    color: 'black',
  },
  detailValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: 'black',
  },
  
  barcodeContainer: {
    alignItems: 'center',
    paddingBottom: 32,
    width: '100%',
    marginTop: 20,
  },
  separatorLine: {
    width: '100%',
    height: 1, 
    marginBottom: 16,
    opacity: 0.5,
  },
  barcodeImage: {
    width: '90%',
    top: 30,
    height: 75,
  },

  ticketNotch: {
    position: 'absolute',
    bottom: 115, 
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#edf3ff',
    zIndex: 10,
  },
  notchLeft: {
    left: -30,
  },
  notchRight: {
    right: -30,
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f7f7f7',
  },
  menuText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'black',
    textAlign: 'left',
  },
  cancelText: {
    color: '#ff4d4f',
  },

  instructionsSection: {
    backgroundColor: 'white',
    paddingVertical: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 300,
  },
  instructionsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'black',
    fontWeight:'bold',
    paddingHorizontal: 24,
    marginBottom: 16,
    textAlign: 'left',
  },
  accordionContainer: {
    width: '100%',
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  accordionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'black',
    textAlign: 'left',
  },
  accordionContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  accordionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#666',
    textAlign: 'left',
    lineHeight: 20,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 34,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    gap: 12,
  },
  shareBtn: {
    width: 48,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadBtn: {
    flex: 1,
    height: 60,
    backgroundColor: '#06193b',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
});

export default ETicketScreen;