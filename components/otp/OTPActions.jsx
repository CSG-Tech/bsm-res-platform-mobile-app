import styled from "styled-components/native";
import { TouchableOpacity, ActivityIndicator } from "react-native";

const OTPActions = ({
  hasError,
  onResend,
  resendLoading,
  timer,
  onVerify,
  isLoading,
  otpLength,
}) => {
  return (
    <>
      {hasError && <ErrorText>Incorrect code. Please try again.</ErrorText>}

      <ResendContainer>
        <ResendLabel>Didn't receive code? </ResendLabel>
        <ResendButton onPress={onResend} disabled={resendLoading || timer > 0}>
          <ResendButtonText disabled={timer > 0}>Resend</ResendButtonText>
        </ResendButton>
      </ResendContainer>

      <VerifyButton onPress={onVerify} disabled={isLoading || otpLength !== 6}>
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <VerifyButtonText>Verify</VerifyButtonText>
        )}
      </VerifyButton>
    </>
  );
};

const ErrorText = styled.Text`
  font-size: 13px;
  color: #ef4444;
  text-align: left;
  margin-bottom: 16px;
  margin-top: -12px;
`;

const ResendContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const ResendLabel = styled.Text`
  font-size: 13px;
  color: #6b7280;
`;

const ResendButton = styled.TouchableOpacity`
  padding: 4px;
`;

const ResendButtonText = styled.Text`
  font-size: 13px;
  color: ${({ disabled }) => (disabled ? "#9CA3AF" : "#3B82F6")};
  font-weight: 500;
  text-decoration-line: underline;
`;

const VerifyButton = styled.TouchableOpacity`
  width: 100%;
  margin-top: 24px;
  background-color: ${({ disabled }) => (disabled ? "#9CA3AF" : "#1E3A5F")};
  border-radius: 12px;
  padding-vertical: 18px;
  align-items: center;
  justify-content: center;
`;

const VerifyButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;

export default OTPActions;