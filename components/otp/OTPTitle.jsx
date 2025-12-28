import styled from "styled-components/native";

const OTPTitle = ({ phoneNumber, onChangePhone }) => {
  return (
    <>
      <Title>Enter 6-Digit Code</Title>
      <DescriptionContainer>
        <Description>
          A verification code has been sent to {phoneNumber}{" "}
        </Description>
        <ChangePhoneButton onPress={onChangePhone}>
          <ChangePhoneText>Change phone number</ChangePhoneText>
        </ChangePhoneButton>
      </DescriptionContainer>
    </>
  );
};

const Title = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 12px;
`;

const DescriptionContainer = styled.View`
  margin-bottom: 32px;
`;

const Description = styled.Text`
  font-size: 14px;
  color: #6b7280;
  line-height: 20px;
`;

const ChangePhoneButton = styled.TouchableOpacity`
  align-self: flex-start;
  margin-top: 4px;
`;

const ChangePhoneText = styled.Text`
  font-size: 14px;
  color: #93c5fd;
  text-decoration-line: underline;
`;

export default OTPTitle;