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
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(Array(length).fill(""));

  useEffect(() => {
    // Update internal state when value prop changes
    if (value) {
      setOtp(value.split("").concat(Array(length).fill("")).slice(0, length));
    } else {
      setOtp(Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (text, index) => {
    // Only accept numbers
    if (text && !/^\d+$/.test(text)) return;

    const newOtp = [...otp];

    // Handle paste - if text length > 1, it's a paste
    if (text.length > 1) {
      const pastedData = text.slice(0, length).split("");
      pastedData.forEach((char, i) => {
        if (index + i < length && /^\d$/.test(char)) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      onChangeText(newOtp.join(""));

      // Focus last filled input or last input
      const lastFilledIndex = Math.min(index + pastedData.length, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();
      return;
    }

    // Single character input
    newOtp[index] = text;
    setOtp(newOtp);
    onChangeText(newOtp.join(""));

    // Auto-focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current box is empty, go to previous and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        onChangeText(newOtp.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <Container>
      {otp.map((digit, index) => (
        <InputBox
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          editable={!disabled}
          hasValue={!!digit}
          hasError={hasError}
          autoFocus={index === 0}
        />
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

const InputBox = styled.TextInput`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  border-width: 2px;
  border-color: ${({ hasError }) => (hasError ? "#EF4444" : "#D1D5DB")};
  background-color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  color: #000000;
`;

export default OTPInput;