import { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getCancellationPolicies } from '../../axios/services/cancellationService';

const CancelTicketsModal = ({ visible, onClose, onConfirm, passengers = [], loading, reservationId }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [loadingPolicy, setLoadingPolicy] = useState(false);

  useEffect(() => {
    if (visible && reservationId) {
      fetchCancellationPolicy();
    }
  }, [visible, reservationId]);

  const fetchCancellationPolicy = async () => {
    setLoadingPolicy(true);
    try {
      const response = await getCancellationPolicies(reservationId);
      const policyData = response?.data || response;
      
      if (policyData && typeof policyData === 'object') {
        setPolicy(policyData);
      } else {
        console.warn('No valid policy data received');
        setPolicy(null);
      }
    } catch (error) {
      console.error('Error fetching cancellation policy:', error);
      setPolicy(null);
    } finally {
      setLoadingPolicy(false);
    }
  };

  const toggleTicketSelection = (ticketId) => {
    setSelectedTicketIds(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedTicketIds, reason);
  };

  const handleClose = () => {
    setReason('');
    setSelectedTicketIds([]);
    Keyboard.dismiss();
    onClose();
  };

  const handleOverlayPress = () => {
    Keyboard.dismiss();
    handleClose();
  };

  const handleContentPress = () => {
    // Prevent overlay press from being triggered
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={handleContentPress}>
              <View style={styles.content}>
                <View style={styles.handle} />
                
                <Text style={styles.title}>{t('eticket.cancelTickets')}</Text>
                
                {/* Warning */}
                <View style={styles.warningBox}>
                  <Ionicons name="warning-outline" size={20} color="#F59E0B" />
                  <Text style={styles.warningText}>
                    {t('eticket.cancelTicketsWarning')}
                  </Text>
                </View>

                {/* Cancellation Policy */}
                {loadingPolicy ? (
                  <ActivityIndicator color="#6291e8" style={{ marginVertical: 16 }} />
                ) : policy ? (
                  <View style={styles.policyBox}>
                    <Text style={styles.policyTitle}>{t('eticket.cancellationPolicy')}</Text>
                    <Text style={styles.policyText}>{policy.policy?.description}</Text>
                    
                    <View style={styles.refundDetails}>
                      <View style={styles.refundRow}>
                        <Text style={styles.refundLabel}>{t('eticket.fullAmount')}:</Text>
                        <Text style={styles.refundValue}>
                          {policy.fullAmount} {policy.currency}
                        </Text>
                      </View>
                      
                      <View style={styles.refundRow}>
                        <Text style={styles.refundLabel}>{t('eticket.refundPercentage')}:</Text>
                        <Text style={styles.refundValue}>{policy.refundPercentage}%</Text>
                      </View>

                      {policy.cancellationFee > 0 && (
                        <View style={styles.refundRow}>
                          <Text style={styles.refundLabel}>{t('eticket.cancellationFee')}:</Text>
                          <Text style={[styles.refundValue, styles.feeValue]}>
                            {policy.cancellationFee} {policy.currency}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={styles.policyBox}>
                    <Text style={styles.policyText}>
                      {t('eticket.policyNotAvailable') || 'Cancellation policy information is not available at this time.'}
                    </Text>
                  </View>
                )}

                <Text style={styles.subtitle}>
                  {t('eticket.selectTicketsToCancel')}
                </Text>

                <ScrollView style={styles.ticketsList}>
                  {passengers && passengers.map((passenger) => (
                    <TouchableOpacity
                      key={passenger.id}
                      style={[
                        styles.ticketItem,
                        selectedTicketIds.includes(passenger.id) && styles.ticketItemSelected
                      ]}
                      onPress={() => toggleTicketSelection(passenger.id)}
                    >
                      <View style={styles.ticketItemContent}>
                        <Ionicons 
                          name={selectedTicketIds.includes(passenger.id) ? "checkbox" : "square-outline"} 
                          size={24} 
                          color={selectedTicketIds.includes(passenger.id) ? "#3B82F6" : "#9CA3AF"} 
                        />
                        <Text style={styles.ticketItemText}>{passenger.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TextInput
                  style={styles.input}
                  placeholder={t('eticket.enterReason')}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <View style={styles.buttons}>
                  <TouchableOpacity 
                    style={styles.buttonSecondary}
                    onPress={handleClose}
                  >
                    <Text style={styles.buttonTextSecondary}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.buttonDanger}
                    onPress={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.buttonTextWhite}>{t('eticket.cancelSelected')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  policyBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  policyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
  },
  policyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  refundDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refundLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  refundValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#000000',
  },
  feeValue: {
    color: '#EF4444',
  },
  ticketsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  ticketItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  ticketItemSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  ticketItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ticketItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#000000',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#000000',
    minHeight: 80,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonSecondary: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  buttonDanger: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  buttonTextSecondary: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
  buttonTextWhite: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});

export default CancelTicketsModal;