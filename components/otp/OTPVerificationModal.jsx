// components/otp/OTPVerificationModal.jsx
import { Modal, ScrollView } from "react-native";
import styled from "styled-components/native";
import { useState, useEffect } from "react";
import { OTPInput, OTPActions, OTPTitle } from "./";
import Toast from "react-native-toast-message";

const OTPVerificationModal = ({ 
  visible, 
  onClose, 
  onSuccess,
  phoneNumber = "+20*********1234",
  title = "OTP Verification"
}) => {
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (timer > 0 && visible) {
      const interval = setInterval(() => setTimer(p => p - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, visible]);

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      setHasError(true);
      Toast.show({ type: "error", text1: "Invalid code" });
      return;
    }

    setIsLoading(true);
    
    // 🔸 MOCK: Just log the OTP
    console.log("✅ OTP Entered:", otpCode);
    
    setTimeout(() => {
      Toast.show({ type: "success", text1: "Verified!" });
      onSuccess?.();
      onClose();
      setIsLoading(false);
    }, 500);
  };

  const handleResend = () => {
    console.log("🔄 Resend OTP clicked");
    setTimer(300);
    Toast.show({ type: "success", text1: "Code resent" });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Overlay onPress={onClose}>
        <Content onPress={(e) => e.stopPropagation()}>
          <Handle />
          
          <Header>
            <BackButton onPress={onClose}>←</BackButton>
            <HeaderTitle>{title}</HeaderTitle>
            <Spacer />
          </Header>

          <OTPTitle phoneNumber={phoneNumber} />

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
      </Overlay>
    </Modal>
  );
};

const Overlay = styled.Pressable`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const Content = styled.Pressable`
  background-color: #ffffff;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 24px;
  padding-bottom: 40px;
  max-height: 90%;
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