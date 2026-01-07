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

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const tripDetailsKeys = [
  "tripNumber", "tripDate", "vessel", "nationality",
  "degree", "route", "passportNumber", "reservationNumber"
];

const accordionItemsKeys = ["ins1", "ins2", "ins3", "ins4", "ins5"];

const generateTicketHtml = ({ t, passengerName, tripDetailsData, logoBase64, barcodeBase64, lineDotBase64, isRTL }) => {
  const detailsRows = tripDetailsKeys.map(key => `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <span style="font-size: 13px; font-weight: bold; color: black;">${t(`eticket.${key}`)}</span>
      <span style="font-size: 13px; color: black;">${tripDetailsData[key]}</span>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en" dir="${isRTL ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>E-Ticket for ${passengerName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #edf3ff; margin: 0; padding: 20px; }
        .card-container { background-color: white; border-radius: 16px; max-width: 400px; width: 100%; margin: auto; box-shadow: 0 8px 25px rgba(154, 189, 255, 0.25); position: relative; overflow: hidden; }
        .card-header { display: flex; justify-content: space-between; align-items: center; padding: 32px; border-bottom: 1px solid #f0f0f0; }
        .passenger-label { font-size: 12px; color: #888d9a; font-weight: bold; margin-bottom: 8px; }
        .passenger-name { font-size: 20px; font-weight: bold; color: black; }
        .logo { width: 60px; height: 60px; }
        .details-container { padding: 24px 32px 40px 32px; }
        .barcode-container { text-align: center; position: relative; padding: 20px 0 32px 0; }
        .separator-line { width: 100%; height: 2px; object-fit: cover; position: absolute; top: -10px; left: 0; }
        .barcode-image { width: 90%; height: 75px; object-fit: contain; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card-container">
        <div class="card-header">
          <div>
            <div class="passenger-label">${t('eticket.passengerNameLabel')}</div>
            <div class="passenger-name">${passengerName}</div>
          </div>
          <img src="${logoBase64}" class="logo" alt="Logo">
        </div>
        <div class="details-container">${detailsRows}</div>
        <div class="barcode-container">
           <img src="${lineDotBase64}" class="separator-line" alt="">
           <img src="${barcodeBase64}" class="barcode-image" alt="Barcode">
        </div>
      </div>
    </body>
    </html>
  `;
};

const AccordionItem = ({ title }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity
        style={[styles.accordionHeader, { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={[styles.accordionTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{title}</Text>
        {expanded ? <ChevronUp size={20} color="#000" /> : <ChevronDown size={20} color="#000" />}
      </TouchableOpacity>
      {expanded && (
        <View style={styles.accordionContent}>
          <Text style={[styles.accordionText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            Perfume, Canned Sodas and Any Electronics.
          </Text>
        </View>
      )}
    </View>
  );
};

const TicketCard = ({ t, passengerName }) => {
  const tripDetailsData = {
    tripNumber: "6",
    tripDate: "16-11-2025",
    vessel: "Amman",
    nationality: "Sudanese",
    degree: "Full Pullman +++",
    route: "Jeddah - Suakin",
    passportNumber: "P08069525",
    reservationNumber: "1234567890123",
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={[styles.cardHeader, { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.passengerLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{t('eticket.passengerNameLabel')}</Text>
            <Text style={[styles.passengerName, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{passengerName}</Text>
          </View>
          <Image source={require('../assets/images/Logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.detailsContainer}>
          {tripDetailsKeys.map((key) => (
            <View key={key} style={[styles.detailRow, { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.detailLabel}>{t(`eticket.${key}`)}</Text>
              <Text style={styles.detailValue}>{tripDetailsData[key]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.barcodeContainer}>
          <Image source={require('../assets/images/linedot.png')} style={styles.separatorLine} resizeMode="stretch" />
          <Image source={require('../assets/images/barcode.png')} style={styles.barcodeImage} resizeMode="contain" />
        </View>
      </View>
      <View style={[styles.ticketNotch, I18nManager.isRTL ? styles.notchRight : styles.notchLeft]} />
      <View style={[styles.ticketNotch, I18nManager.isRTL ? styles.notchLeft : styles.notchRight]} />
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

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const assetsRef = useRef({ logo: null, barcode: null, lineDot: null });

  useEffect(() => {
    const loadAssetsAsBase64 = async () => {
        const toBase64 = async (assetModule) => {
            try {
                const asset = Asset.fromModule(assetModule);
                await asset.downloadAsync();
                const base64 = await FileSystem.readAsStringAsync(asset.localUri, { 
                    encoding: 'base64' 
                });
                return `data:image/png;base64,${base64}`;
            } catch (error) {
                console.error('Error converting asset to base64:', error);
                return null;
            }
        };
        assetsRef.current.logo = await toBase64(require('../assets/images/Logo.png'));
        assetsRef.current.barcode = await toBase64(require('../assets/images/barcode.png'));
        assetsRef.current.lineDot = await toBase64(require('../assets/images/linedot.png'));
        setAssetsLoaded(true);
    };
    loadAssetsAsBase64();
  }, []);

  useEffect(() => {
    const loadPassengers = () => {
      let parsedPassengers = [];
      if (params.passengersData) {
          try {
              parsedPassengers = JSON.parse(params.passengersData);
          } catch (e) {
              parsedPassengers = [];
          }
      }

      if (parsedPassengers.length > 0) {
          const formatted = parsedPassengers.map((p, i) => ({
              id: p.id || i,
              name: p.firstName ? `${p.firstName} ${p.lastName}` : `Passenger ${i + 1}`,
              label: t('eticket.passenger', { num: i + 1 })
          }));
          setPassengers(formatted);
      } else {
          const count = params.passengerCount ? parseInt(params.passengerCount, 10) : 1;
          const dummy = Array.from({ length: count }, (_, i) => ({
              id: i,
              name: `Passenger ${i + 1}`,
              label: t('eticket.passenger', { num: i + 1 })
          }));
          setPassengers(dummy);
      }
    };
    loadPassengers();
  }, [params.passengersData, params.passengerCount, t]);

  const handleMenuPress = () => {
    if (menuButtonRef.current) {
      menuButtonRef.current.measureInWindow((x, y, width, height) => {
        setMenuPosition({
          top: y + height + 5,
          right: I18nManager.isRTL ? undefined : 24,
          left: I18nManager.isRTL ? 24 : undefined,
        });
        setMenuVisible(true);
      });
    }
  };

  const handleShareOrDownload = async () => {
    if (!assetsLoaded) {
      alert("Ticket assets are still loading, please try again in a moment.");
      return;
    }
    const currentPassengerName = passengers[selectedPassengerIndex]?.name || "Ahmed Ibrahim";
    const tripDetailsData = {
        tripNumber: "6", tripDate: "16-11-2025", vessel: "Amman",
        nationality: "Sudanese", degree: "Full Pullman +++", route: "Jeddah - Suakin",
        passportNumber: "P08069525", reservationNumber: "1234567890123",
    };
    const htmlContent = generateTicketHtml({
        t, passengerName: currentPassengerName, tripDetailsData,
        logoBase64: assetsRef.current.logo, barcodeBase64: assetsRef.current.barcode,
        lineDotBase64: assetsRef.current.lineDot, isRTL: I18nManager.isRTL,
    });

    try {
        await Print.printAsync({
            html: htmlContent,
        });
    } catch (error) {
        console.error("Failed to open print dialog:", error);
        alert("An error occurred while preparing the ticket.");
    }
  };
  
  const currentPassengerName = passengers[selectedPassengerIndex]?.name || "Ahmed Ibrahim";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#edf3ff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={28} color="#000" style={I18nManager.isRTL && { transform: [{ scaleX: -1 }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('eticket.headerTitle')}</Text>
          <TouchableOpacity ref={menuButtonRef} style={styles.iconButton} onPress={handleMenuPress}>
            <MoreHorizontal size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll} inverted={I18nManager.isRTL}>
              {passengers.map((p, index) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.tabButton, index === selectedPassengerIndex ? styles.tabButtonActive : styles.tabButtonInactive]}
                  onPress={() => setSelectedPassengerIndex(index)}
                >
                  <Text style={styles.tabText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <TicketCard t={t} passengerName={currentPassengerName} />
          </View>

          <View style={styles.instructionsSection}>
            <Text style={[styles.instructionsTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{t('eticket.instructionsTitle')}</Text>
            <View style={styles.accordionContainer}>
              {accordionItemsKeys.map((itemKey, index) => (
                <AccordionItem key={index} title={t(`eticket.${itemKey}`)} />
              ))}
            </View>
          </View>
        </ScrollView>
        
        <View style={[styles.footer, { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShareOrDownload}>
            <Share2 size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadBtn} onPress={handleShareOrDownload}>
            <Text style={styles.downloadText}>{t('eticket.download')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal transparent={true} visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <View style={[styles.menuContainer, { top: menuPosition.top, right: menuPosition.right, left: menuPosition.left }]}>
              <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <Text style={[styles.menuText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{t('eticket.viewTransaction')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <Text style={[styles.menuText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{t('eticket.changeDegree')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <Text style={[styles.menuText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{t('eticket.reschedule')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setMenuVisible(false)}>
                <Text style={[styles.menuText, styles.cancelText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{t('eticket.cancelBooking')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#edf3ff' },
  container: { flex: 1 },
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
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 18, color: 'black' },
  iconButton: { padding: 4 },
  scrollContent: { paddingBottom: 120 },
  tabsContainer: { marginBottom: 30 },
  tabsScroll: { paddingHorizontal: 24, gap: 12 },
  tabButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  tabButtonActive: { backgroundColor: '#cbdaf9', borderColor: '#6291e8' },
  tabButtonInactive: { backgroundColor: 'white', borderColor: '#e5e7eb' },
  tabText: { fontFamily: 'Inter-Medium', fontSize: 14, color: 'black' },
  section: { paddingHorizontal: 24, marginBottom: 24 },
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
  cardContent: { padding: 0 },
  cardHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardHeaderLeft: { gap: 8, flex: 1 },
  passengerLabel: { fontFamily: 'Inter-Bold', fontSize: 12, color: '#888d9a' },
  passengerName: { fontFamily: 'Inter-Bold', fontSize: 20, fontWeight: 'bold', color: 'black' },
  logo: { width: 60, height: 60 },
  detailsContainer: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 24,
  },
  detailRow: { justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontFamily: 'Inter-Bold', fontSize: 13, fontWeight: 'bold', color: 'black' },
  detailValue: { fontFamily: 'Inter-Regular', fontSize: 13, color: 'black' },
  barcodeContainer: { alignItems: 'center', paddingBottom: 32, width: '100%', marginTop: 20 },
  separatorLine: { width: '100%', height: 1, marginBottom: 16, opacity: 0.5 },
  barcodeImage: { width: '90%', top: 30, height: 75 },
  ticketNotch: {
    position: 'absolute',
    bottom: 115, 
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#edf3ff',
    zIndex: 10,
  },
  notchLeft: { left: -30 },
  notchRight: { right: -30 },
  menuOverlay: { flex: 1, backgroundColor: 'transparent' },
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
  menuItem: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f7f7f7' },
  menuText: { fontFamily: 'Inter-Medium', fontSize: 14, color: 'black' },
  cancelText: { color: '#ff4d4f' },
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
  },
  accordionContainer: { width: '100%' },
  accordionItem: { borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  accordionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  accordionTitle: { fontFamily: 'Inter-Medium', fontSize: 14, color: 'black', flex: 1 },
  accordionContent: { paddingHorizontal: 24, paddingBottom: 16 },
  accordionText: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#666', lineHeight: 20 },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
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
  shareBtn: { width: 48, height: 56, justifyContent: 'center', alignItems: 'center' },
  downloadBtn: {
    flex: 1,
    height: 60,
    backgroundColor: '#06193b',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadText: { fontFamily: 'Inter-Bold', fontSize: 16, color: 'white' },
});

export default ETicketScreen;