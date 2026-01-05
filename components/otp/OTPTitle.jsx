import styled from "styled-components/native";
import { TouchableOpacity } from "react-native";

const OTPTitle = ({ email = "", showChangeEmail = true }) => {
  const handleChangeEmail = () => {
    // TODO: Implement email change modal
    console.log("Change email clicked");
  };

  return (
    <Container>
      <Title>Enter Verification Code</Title>
      <Description>
        We sent a 6-digit code to{"\n"}
        <EmailText>{email}</EmailText>
      </Description>
      {showChangeEmail && (
        <TouchableOpacity onPress={handleChangeEmail}>
          <ChangeEmailText>Change email</ChangeEmailText>
        </TouchableOpacity>
      )}
    </Container>
  );
};

const Container = styled.View`
  margin-bottom: 32px;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin-bottom: 12px;
  font-family: 'Inter-Bold';
`;

const Description = styled.Text`
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 20px;
  font-family: 'Inter-Regular';
`;

const EmailText = styled.Text`
  font-weight: 600;
  color: #007bff;
  font-family: 'Inter-SemiBold';
`;

const ChangeEmailText = styled.Text`
  font-size: 14px;
  color: #007bff;
  margin-top: 8px;
  font-family: 'Inter-SemiBold';
`;

export default OTPTitle;