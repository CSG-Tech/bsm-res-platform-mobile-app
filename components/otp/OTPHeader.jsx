import styled from "styled-components/native";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

const OTPHeader = () => {
  return (
    <HeaderContainer>
      <BackButton onPress={() => router.back()}>
        <AntDesign name="arrowleft" size={24} color="#000000" />
      </BackButton>
      <HeaderTitle>OTP Verification</HeaderTitle>
      <Spacer />
    </HeaderContainer>
  );
};

const HeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 40px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  flex: 1;
  text-align: center;
`;

const Spacer = styled.View`
  width: 40px;
`;

export default OTPHeader;