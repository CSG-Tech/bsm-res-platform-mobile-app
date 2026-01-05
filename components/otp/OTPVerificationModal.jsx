import { Modal, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import styled from "styled-components/native";
import { useState, useEffect } from "react";
import { OTPInput, OTPActions, OTPTitle } from "./";
import Toast from "react-native-toast-message";
import { sendOTP, verifyOTP, resendOTP, getReservationEmail } from "../../axios/services/otpService";

const OTPVerificationModal = ({ 
  visible, 
  onClose, 
  onSuccess,
  reservationId,
  purpose = "CANCEL_RESERVATION",
  title = "OTP Verification",
  initialEmail = "", // Email passed from parent (optional)
}) => {
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [hasError, setHasError] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [isGenerating, setIsGenerating] = useState(false);
  const [otpGenerated, setOtpGenerated] = useState(false);

  // Fetch user email if not provided
  useEffect(() => {
    const fetchUserEmail = async () => {
      if (!email && visible) {
        try {
          const userInfo = await getReservationEmail(reservationId);
          if (userInfo?.email) {
            setEmail(userInfo.email);
          }
        } catch (error) {
          console.error('Failed to fetch user email:', error);
          Toast.show({ 
            type: "error", 
            text1: "Failed to load email", 
            text2: "Please try again" 
          });
        }
      }
    };

    fetchUserEmail();
  }, [visible, email, reservationId]);

  // Generate OTP when modal opens
  useEffect(() => {
    const generateOTP = async () => {
      if (visible && !otpGenerated && email && reservationId) {
        setIsGenerating(true);
        try {
          await sendOTP({
            reservationId,
            purpose,
            email,
          });
          
          setOtpGenerated(true);
          Toast.show({ 
            type: "success", 
            text1: "OTP Sent", 
            text2: `Check your email at ${email}` 
          });
        } catch (error) {
          console.error('Failed to generate OTP:', error);
          Toast.show({ 
            type: "error", 
            text1: "Failed to send OTP", 
            text2: error.response?.data?.message || "Please try again" 
          });
          onClose(); // Close modal if OTP generation fails
        } finally {
          setIsGenerating(false);
        }
      }
    };

    generateOTP();
  }, [visible, email, reservationId, purpose, otpGenerated]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setOtpCode("");
      setHasError(false);
      setTimer(300);
      setOtpGenerated(false);
    }
  }, [visible]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0 && visible && otpGenerated) {
      const interval = setInterval(() => setTimer(p => p - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, visible, otpGenerated]);

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      setHasError(true);
      Toast.show({ type: "error", text1: "Invalid code", text2: "Please enter 6 digits" });
      return;
    }

    setIsLoading(true);
    
    try {
      await verifyOTP({
        reservationId,
        otpCode,
        purpose,
      });
      
      Toast.show({ type: "success", text1: "Verified!" });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('OTP verification failed:', error);
      setHasError(true);
      Toast.show({ 
        type: "error", 
        text1: "Verification failed", 
        text2: error.response?.data?.message || "Invalid or expired code" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !reservationId) return;

    setIsLoading(true);
    try {
      await resendOTP({
        reservationId,
        purpose,
        email,
      });
      
      setTimer(300);
      setOtpCode("");
      setHasError(false);
      Toast.show({ type: "success", text1: "Code resent", text2: `Check ${email}` });
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      Toast.show({ 
        type: "error", 
        text1: "Failed to resend", 
        text2: error.response?.data?.message || "Please try again" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayPress = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleContentPress = () => {
    // Prevents overlay press when pressing inside modal
  };

  // Show loading while generating OTP
  if (isGenerating) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <Overlay>
          <Content>
            <ActivityIndicator size="large" color="#007bff" />
            <LoadingText>Sending OTP to {email}...</LoadingText>
          </Content>
        </Overlay>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <Overlay>
            <TouchableWithoutFeedback onPress={handleContentPress}>
              <Content>
                <Handle />
                
                <Header>
                  <BackButton onPress={onClose}>←</BackButton>
                  <HeaderTitle>{title}</HeaderTitle>
                  <Spacer />
                </Header>

                <OTPTitle email={email} showChangeEmail={!initialEmail} />

                <OTPInput
                  length={6}
                  value={otpCode}
                  onChangeText={(text) => {
                    setOtpCode(text);
                    setHasError(false);
                  }}
                  disabled={isLoading}
                  hasError={hasError}
                />

                <OTPActions
                  hasError={hasError}
                  onResend={handleResend}
                  timer={timer}
                  onVerify={handleVerify}
                  isLoading={isLoading}
                  otpLength={otpCode.length}
                />
              </Content>
            </TouchableWithoutFeedback>
          </Overlay>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const Content = styled.View`
  background-color: #ffffff;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 24px;
  padding-bottom: 40px;
  max-height: 90%;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.Text`
  margin-top: 16px;
  font-size: 16px;
  color: #666;
  font-family: 'Inter-Regular';
`;

const Handle = styled.View`
  width: 40px;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  align-self: center;
  margin-bottom: 20px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const BackButton = styled.Text`
  font-size: 24px;
  color: #000;
  width: 40px;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #000;
  flex: 1;
  text-align: center;
`;

const Spacer = styled.View`
  width: 40px;
`;

export default OTPVerificationModal;