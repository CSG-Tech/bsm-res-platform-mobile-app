import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, MoreHorizontal, Share2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  I18nManager,
  Image,
  Keyboard,
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
import { Ionicons } from '@expo/vector-icons';
import { getReservation } from '../../axios/services/ticketService';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import OTPVerificationModal from '../otp/OTPVerificationModal';
import { cancelReservation, cancelTickets, getCancellationPolicies } from '../../axios/services/cancellationService';
import CancelReservationModal from '../modals/CancelReservationsModal';
import CancelTicketsModal from '../modals/CancelTicketsModal';
import Toast from 'react-native-toast-message';
import { getReservationEmail } from '../../axios/services/otpService';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Dynamic Data based on translation keys ---
const tripDetailsKeys = [
  "tripNumber", "ticketNumber", "tripDate", "vessel", "nationality",
  "degree", "route", "passportNumber", "reservationNumber"
];

const accordionItemsKeys = ["ins1", "ins2", "ins3", "ins4", "ins5"];


// --- Helper Components ---
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

const TicketCard = ({ t, i18n, passengerName, ticketData, summaryData }) => {
  // Determine ticket status
  const getTicketStatus = () => {
    if (ticketData?.status === 'C') return { text: t('eticket.cancelled'), color: '#EF4444', bgColor: '#FEE2E2' };
    if (ticketData?.status === 'I') return { text: t('eticket.issued'), color: '#10B981', bgColor: '#D1FAE5' };
    return { text: t('eticket.processing'), color: '#F59E0B', bgColor: '#FEF3C7' };
  };

  const ticketStatus = getTicketStatus();
  const isCancelled = ticketData?.status === 'C';

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Build trip details from API data
  const tripDetailsData = {
    tripNumber: summaryData?.tripSerial || ticketData?.tripSerial || '',
    tripDate: formatDate(summaryData?.startDate) || '',
    vessel: summaryData?.vessel || '',
    nationality: i18n.language === 'ar' ? ticketData?.nationality?.natArbName : ticketData?.nationality?.natName,
    degree: i18n.language === 'ar' ? ticketData?.degree?.degreeArabName : ticketData?.degree?.degreeEnglishName,
    route: summaryData ? `${i18n.language === 'ar' ? summaryData.fromPortArab : summaryData.fromPortEng} - ${i18n.language === 'ar' ? summaryData.toPortArab : summaryData.toPortEng}` : '',
    passportNumber: ticketData?.passportNumber || '',
    ticketNumber: ticketData?.oraclePrintTicketNo || '',
    reservationNumber: ticketData?.oracleAgentResNo || ticketData?.oracleTicketNo || '',
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={[
          styles.cardHeader, 
          { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' },
          isCancelled && styles.cardHeaderCancelled
        ]}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.passengerLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{t('eticket.passengerNameLabel')}</Text>
            <Text style={[styles.passengerName, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{passengerName}</Text>
            
            {/* Ticket Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: ticketStatus.bgColor }]}>
              <Text style={[styles.statusText, { color: ticketStatus.color }]}>
                {ticketStatus.text}
              </Text>
            </View>
          </View>
          <Image source={require('../../assets/images/Logo.png')} style={styles.logo} resizeMode="contain" />
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
          <Image source={require('../../assets/images/linedot.png')} style={styles.separatorLine} resizeMode="stretch" />
          {ticketData?.oraclePrintTicketNo && String(ticketData.oraclePrintTicketNo).length > 0 && (
            <Barcode value={String(ticketData.oraclePrintTicketNo)} format="CODE128" />
          )}
        </View>
      </View>
      <View style={[styles.ticketNotch, I18nManager.isRTL ? styles.notchRight : styles.notchLeft, isCancelled && styles.ticketNotchCancelled]} />
      <View style={[styles.ticketNotch, I18nManager.isRTL ? styles.notchLeft : styles.notchRight, isCancelled && styles.ticketNotchCancelled]} />
    </View>
  );
};


// --- Main Screen Component ---
const ETicketScreen = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams();
  
  const [passengers, setPassengers] = useState([]);
  const [selectedPassengerIndex, setSelectedPassengerIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 24 });
  const [loading, setLoading] = useState(true);
  const [reservationData, setReservationData] = useState(null);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const menuButtonRef = useRef(null);
  const [showOTP, setShowOTP] = useState(false);
  const [showTicketCancelOTP, setShowTicketCancelOTP] = useState(false);
  const [showCancelReservationModal, setShowCancelReservationModal] = useState(false);
  const [showCancelTicketsModal, setShowCancelTicketsModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [cancelling, setCancelling] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Fetch user email on component mount

    const fetchUserEmail = async () => {
      try {
        const userInfo = await getReservationEmail(params.reservationNumber);
        if (userInfo?.email) {
          setUserEmail(userInfo.email);
        }
      } catch (error) {
        console.error('Failed to fetch user email:', error);
      }
    };


  useEffect(() => {
    const fetchReservationData = async () => {
      try {
        setLoading(true);
        setError(null);
        setNoResults(false);

        // Build search object from params
        const searchObject = {
          lastName: params.lastName || '',
          passportNumber: params.passportNumber || '',
          reservationId: params.reservationNumber || '',
        };

        console.log('Fetching reservation with:', searchObject);

        const response = await getReservation(searchObject);

        console.log('Reservation data received:', response);

        // Check if response has no tickets
        if (!response || !response.tickets || response.tickets.length === 0) {
          setNoResults(true);
          setPassengers([]);
          return;
        }

        setReservationData(response);

        // Map tickets to passengers
        const formattedPassengers = response.tickets.map((ticket, index) => ({
          id: ticket.id,
          name: ticket.passengerName || `${ticket.passengerFirstName} ${ticket.passengerLastName}`,
          label: t('eticket.passenger', { num: index + 1 }),
          ticketData: ticket,
        }));
        setPassengers(formattedPassengers);
        // 🎯 AUTO-SELECT THE PASSENGER THAT MATCHES SEARCH CRITERIA
        const searchPassportNumber = params.passportNumber?.toLowerCase().trim();
        const searchLastName = params.lastName?.toLowerCase().trim();

        if (searchPassportNumber || searchLastName) {
          const matchingIndex = formattedPassengers.findIndex((passenger) => {
            const ticketPassport = passenger.ticketData?.passportNumber?.toLowerCase().trim();
            const ticketLastName = passenger.ticketData?.passengerLastName?.toLowerCase().trim();
            const ticketFullName = passenger.name?.toLowerCase().trim();

            // Check if passport matches
            if (searchPassportNumber && ticketPassport === searchPassportNumber) {
              return true;
            }

            // Check if last name matches
            if (searchLastName && (
              ticketLastName === searchLastName || 
              ticketFullName?.includes(searchLastName)
            )) {
              return true;
            }

            return false;
          });

          // If found, select that passenger
          if (matchingIndex !== -1) {
            console.log(`Auto-selecting passenger at index ${matchingIndex}`);
            setSelectedPassengerIndex(matchingIndex);
          }
        }

      } catch (err) {
        console.error('Error fetching reservation:', err);
        if(err.response && err.response.status === 404) {
          setNoResults(true);
        } else {
          setError(err.message || 'Failed to load reservation');
        }
        setPassengers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservationData();
    fetchUserEmail();
  }, [params.lastName, params.passportNumber, params.reservationNumber, t]);

  // Check if reservation is cancelled
  const isReservationCancelled = () => {
    // Check if status is explicitly CANCELLED
    if (reservationData?.status === 'CANCELLED') return true;
    
    // Check if all tickets are cancelled
    if (reservationData?.tickets && reservationData.tickets.length > 0) {
      return reservationData.tickets.every(ticket => ticket.status === 'C');
    }
    
    return false;
  };

  const redirectToTransaction = () =>{
    router.push({
    pathname: '/confirmation',
    params: {
      reservationId: params.reservationNumber
    }
  });

  }

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

  const handleDownload = () => {
    router.push({
      pathname: '/confirmation',
      params: {
        ...params,
      }
    });
  };

  const handleCancelReservationConfirm = async (reason) => {
    
    const resId = params.reservationNumber || reservationData?.tickets?.[0]?.reservationId;
    
    setCancelling(true);
    try {
      await cancelReservation({
        reservationId: Number(resId),
        reason: reason,
        refundType: 'full'
      });
      
      // Close modal first
      setShowCancelReservationModal(false);
      
      // Show success alert
      Alert.alert(
        t('eticket.cancellationSuccessTitle'),
        t('eticket.reservationCancelledSuccessMessage'),
        [
          {
            text: t('common.ok'),
            onPress: async () => {
              // Refresh the reservation data
              await refreshReservationData();
            }
          }
        ],
        { cancelable: false }
      );
      
    } catch (error) {
      console.error('Cancel reservation error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 409) {
        Alert.alert(
          t('eticket.alreadyCancelledTitle'),
          t('eticket.alreadyCancelledMessage'),
          [
            {
              text: t('common.ok'),
              onPress: () => setShowCancelReservationModal(false)
            }
          ]
        );
      } else if (error.response?.status === 400) {
        Alert.alert(
          t('eticket.cannotCancelTitle'),
          t('eticket.cannotCancelRefunded'),
          [
            {
              text: t('common.ok'),
              onPress: () => setShowCancelReservationModal(false)
            }
          ]
        );
      } else {
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error
          || error.message 
          || t('eticket.cancellationFailed');
        
        Alert.alert(
          t('error.title'),
          errorMessage,
          [{ text: t('common.ok') }]
        );
      }
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelTicketsConfirm = async (ticketIds, reason) => {
    
    setCancelling(true);
    try {
      await cancelTickets({ ticketIds, reason });
      
      // Close modal first
      setShowCancelTicketsModal(false);
      
      // Show success alert
      Alert.alert(
        t('eticket.cancellationSuccessTitle'),
        t('eticket.ticketsCancelledSuccessMessage'),
        [
          {
            text: t('common.ok'),
            onPress: async () => {
              // Refresh the reservation data
              await refreshReservationData();
            }
          }
        ],
        { cancelable: false }
      );
      
    } catch (error) {
      console.error('Cancel tickets error:', error);
      
      if (error.response?.status === 409) {
        Alert.alert(
          t('eticket.alreadyCancelledTitle'),
          t('eticket.alreadyCancelledMessage'),
          [{ text: t('common.ok'), onPress: () => setShowCancelTicketsModal(false) }]
        );
      } else if (error.response?.status === 400) {
        Alert.alert(
          t('eticket.cannotCancelTitle'),
          t('eticket.cannotCancelRefunded'),
          [{ text: t('common.ok'), onPress: () => setShowCancelTicketsModal(false) }]
        );
      } else {
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error
          || error.message 
          || t('eticket.cancellationFailed');
        
        Alert.alert(
          t('error.title'),
          errorMessage,
          [{ text: t('common.ok') }]
        );
      }
    } finally {
      setCancelling(false);
    }
  };

  // Add this refresh function
  const refreshReservationData = async () => {
    try {
      setLoading(true);
      
      const searchObject = {
        lastName: params.lastName || '',
        passportNumber: params.passportNumber || '',
        reservationId: params.reservationNumber || '',
      };

      const response = await getReservation(searchObject);

      if (!response || !response.tickets || response.tickets.length === 0) {
        setNoResults(true);
        setPassengers([]);
        return;
      }

      setReservationData(response);

      const formattedPassengers = response.tickets.map((ticket, index) => ({
        id: ticket.id,
        name: ticket.passengerName || `${ticket.passengerFirstName} ${ticket.passengerLastName}`,
        label: t('eticket.passenger', { num: index + 1 }),
        ticketData: ticket,
      }));
      setPassengers(formattedPassengers);
    } catch (err) {
      console.error('Error refreshing reservation:', err);
    } finally {
      setLoading(false);
    }
  };
  const currentPassenger = passengers[selectedPassengerIndex];
  const currentPassengerName = currentPassenger?.name || "Passenger";
  const currentTicketData = currentPassenger?.ticketData;

  // Show loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#edf3ff" />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#6291e8" />
          <Text style={styles.loadingText}>{t('eticket.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error screen
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#edf3ff" />
        <View style={[styles.container, styles.loadingContainer]}>
          <Text style={styles.errorText}>{t('eticket.error')}</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>{t('eticket.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show no results screen
  if (noResults) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#edf3ff" />
        <View style={[styles.container, styles.loadingContainer]}>
          <Ionicons name="search-outline" size={64} color="#6291e8" />
          <Text style={styles.noResultsTitle}>{t('eticket.noResults')}</Text>
          <Text style={styles.noResultsMessage}>{t('eticket.noResultsMessage')}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>{t('eticket.searchAgain')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const reservationCancelled = isReservationCancelled();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#edf3ff" />
      <View style={styles.container}>
        {reservationCancelled && (
          <View style={styles.cancelledBanner}>
            <Ionicons name="close-circle" size={18} color="#FFF" />
            <Text style={styles.cancelledBannerText}>{t('eticket.reservationCancelled')}</Text>
          </View>
        )}
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={28} color="#000" style={I18nManager.isRTL && { transform: [{ scaleX: -1 }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('eticket.headerTitle')}
          </Text>
          <TouchableOpacity ref={menuButtonRef} style={styles.iconButton} onPress={handleMenuPress}>
            <MoreHorizontal size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll} inverted={I18nManager.isRTL}>
              {passengers.map((p, index) => {
                const isCancelled = p.ticketData?.status === 'C';
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.tabButton, 
                      index === selectedPassengerIndex ? styles.tabButtonActive : styles.tabButtonInactive,
                      isCancelled && styles.tabButtonCancelled
                    ]}
                    onPress={() => setSelectedPassengerIndex(index)}
                  >
                    <Text style={[styles.tabText, isCancelled && styles.tabTextCancelled]}>{p.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <TicketCard 
              t={t} 
              i18n={i18n}
              passengerName={currentPassengerName} 
              ticketData={currentTicketData}
              summaryData={reservationData?.summary}
            />
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionButtonDanger}
              onPress={() => setShowOTP(true)}
            >
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.actionButtonTextDanger}>{t('eticket.cancelBooking')}</Text>
            </TouchableOpacity>
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
          <TouchableOpacity style={styles.shareBtn}>
            <Share2 size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
            <Text style={styles.downloadText}>{t('eticket.download')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal transparent={true} visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <View style={[styles.menuContainer, { top: menuPosition.top, right: menuPosition.right, left: menuPosition.left }]}>
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                setMenuVisible(false);
                redirectToTransaction();
                }}>
                <Text style={[styles.menuText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{t('eticket.viewTransaction')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                setMenuVisible(false); 
                setShowTicketCancelOTP(true);
              }}>
                <Text style={[styles.menuText, styles.cancelText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  {t('eticket.cancelTickets')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {showOTP && (
        <OTPVerificationModal
          visible={showOTP}
          onClose={() => setShowOTP(false)}
          onSuccess={() => {
            console.log("OTP Success!");
            setShowOTP(false);
            setTimeout(() => {
              setShowCancelReservationModal(true);
            }, 500);
          }}
          reservationId={params.reservationNumber || reservationData?.tickets?.[0]?.reservationId}
          purpose="CANCEL_RESERVATION"
          initialEmail={userEmail} // Pass email from user info
        />
      )}

      {showTicketCancelOTP && (
        <OTPVerificationModal
          visible={showTicketCancelOTP}
          onClose={() => setShowTicketCancelOTP(false)}
          onSuccess={() => {
            console.log("OTP Success for ticket cancellation!");
            setShowTicketCancelOTP(false);
            setTimeout(() => {
              setShowCancelTicketsModal(true);
            }, 500);
          }}
          reservationId={params.reservationNumber || reservationData?.tickets?.[0]?.reservationId}
          purpose="CANCEL_RESERVATION"
          initialEmail={userEmail}
        />
      )}

      {showCancelReservationModal && (
        <CancelReservationModal
          visible={showCancelReservationModal}
          onClose={() => setShowCancelReservationModal(false)}
          onConfirm={handleCancelReservationConfirm}
          loading={cancelling}
          reservationId={params.reservationNumber || reservationData?.tickets?.[0]?.reservationId}
        />
      )}

      {showCancelTicketsModal && (
        <CancelTicketsModal
          visible={showCancelTicketsModal}
          onClose={() => setShowCancelTicketsModal(false)}
          passengers={passengers}
          onConfirm={handleCancelTicketsConfirm}
          loading={cancelling}
          reservationId={params.reservationNumber || reservationData?.tickets?.[0]?.reservationId}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#edf3ff' },
  container: { flex: 1 },
  cancelledBanner: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  cancelledBannerText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#FFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ff4d4f',
    marginBottom: 8,
  },
  errorMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#06193b',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  retryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
  noResultsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
    lineHeight: 22,
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
  tabButtonCancelled: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  tabText: { fontFamily: 'Inter-Medium', fontSize: 14, color: 'black' },
  tabTextCancelled: { color: '#EF4444' },
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
  cardHeaderCancelled: {
    backgroundColor: '#FEE2E2',
  },
  cardHeaderLeft: { gap: 8, flex: 1 },
  passengerLabel: { fontFamily: 'Inter-Bold', fontSize: 12, color: '#888d9a' },
  passengerName: { fontFamily: 'Inter-Bold', fontSize: 20, fontWeight: 'bold', color: 'black' },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    fontWeight: 'bold',
  },
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
  ticketNotchCancelled: {
    backgroundColor: '#FEE2E2',
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
  actionButtonsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonTextPrimary: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#3B82F6',
  },
  actionButtonDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonTextDanger: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#EF4444',
  },
});

export default ETicketScreen;