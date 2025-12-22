import { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
  ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { getCancellationPolicies } from '../../axios/services/cancellationService';
import { Ionicons } from '@expo/vector-icons';

const CancelReservationModal = ({ visible, onClose, onConfirm, loading, reservationId }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
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
      console.log('Cancellation policy response:', response);
      // Handle both response.data and direct response
      setPolicy(response.data || response);
    } catch (error) {
      console.error('Error fetching cancellation policy:', error);
    } finally {
      setLoadingPolicy(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(reason);
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.handle} />
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>{t('eticket.cancelReservation')}</Text>
                
                {/* Warning */}
                <View style={styles.warningBox}>
                  <Ionicons name="warning-outline" size={20} color="#F59E0B" />
                  <Text style={styles.warningText}>
                    {t('eticket.cancelWarning')}
                  </Text>
                </View>

                {/* Cancellation Policy */}
                {loadingPolicy ? (
                  <ActivityIndicator color="#6291e8" style={{ marginVertical: 16 }} />
                ) : policy ? (
                  <View style={styles.policyBox}>
                    <Text style={styles.policyTitle}>{t('eticket.cancellationPolicy')}</Text>
                    
                    {/* Policy Description (not translated) */}
                    <Text style={styles.policyText}>{policy.policy?.description}</Text>
                    
                    {/* Refund Details */}
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

                      <View style={[styles.refundRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>{t('eticket.refundAmount')}:</Text>
                        <Text style={styles.totalAmount}>
                          {policy.refundableAmount} {policy.currency}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}

                <Text style={styles.subtitle}>
                  {t('eticket.provideReason')}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder={t('eticket.enterReason')}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
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
                      <Text style={styles.buttonTextWhite}>{t('eticket.confirmCancellation')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#000000',
  },
  totalAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#10B981',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#000000',
    minHeight: 100,
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

export default CancelReservationModal;