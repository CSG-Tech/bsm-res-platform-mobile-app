import { useRef, useState, useEffect } from "react";
import styled from "styled-components/native";
import { TextInput, View } from "react-native";

const OTPInput = ({
  length = 6,
  value,
  onChangeText,
  disabled = false,
  hasError = false,
}) => {
  const hiddenInputRef = useRef(null);
  const [otp, setOtp] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setOtp(value);
    }
  }, [value]);

  const handleChange = (text) => {
    // Only accept numbers up to length
    const cleaned = text.replace(/\D/g, "").slice(0, length);
    setOtp(cleaned);
    onChangeText(cleaned);
  };

  const handleBoxPress = () => {
    hiddenInputRef.current?.focus();
  };

  const otpArray = otp.split("").concat(Array(length).fill("")).slice(0, length);
  const currentPosition = otp.length; // Current cursor position

  return (
    <Container>
      <HiddenInput
        ref={hiddenInputRef}
        value={otp}
        onChangeText={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        editable={!disabled}
        autoFocus
      />
      {otpArray.map((digit, index) => (
        <InputBox
          key={index}
          onPress={handleBoxPress}
          hasValue={!!digit}
          hasError={hasError}
          isActive={isFocused && index === currentPosition}
        >
          <DigitText hasValue={!!digit}>{digit}</DigitText>
        </InputBox>
      ))}
    </Container>
  );
};

const Container = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-vertical: 20px;
  gap: 8px;
`;

const HiddenInput = styled.TextInput`
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
`;

const InputBox = styled.Pressable`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  border-width: 2px;
  border-color: ${({ hasError, isActive }) =>
    hasError ? "#EF4444" : isActive ? "#3B82F6" : "#D1D5DB"};
  background-color: #ffffff;
  justify-content: center;
  align-items: center;
`;

const DigitText = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #000000;
`;

export default OTPInput;