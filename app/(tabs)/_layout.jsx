import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const wp = (percentage) => (SCREEN_WIDTH * percentage) / 100;
const hp = (percentage) => (SCREEN_HEIGHT * percentage) / 100;
const fontSize = (size) => (SCREEN_WIDTH / 375) * size;

export default function TabLayout() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: hp(11.8),
          backgroundColor: 'white',
          borderTopLeftRadius: wp(6.4),
          borderTopRightRadius: wp(6.4),
          paddingHorizontal: wp(8),
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -hp(0.5) },
          shadowOpacity: 0.1,
          shadowRadius: hp(1),
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#092863',
        tabBarInactiveTintColor: '#878d9a',
        tabBarLabelStyle: {
          fontFamily: 'Inter-Regular',
          fontSize: fontSize(12),
          fontWeight: 'bold',
          marginTop: -hp(0.5),
          marginBottom: hp(1),
        },
        tabBarIconStyle: {
          marginTop: hp(1),
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, focused }) => (
            <Entypo name="home" size={fontSize(24)} color={color} />
          ),
          tabBarItemStyle: focused => ({
            backgroundColor: focused ? '#ecf1f9' : 'transparent',
            borderRadius: wp(4.3),
            marginTop: focused ? -hp(1.25) : 0,
            marginBottom: focused ? -hp(1.25) : 0,
          }),
        }}
      />
      <Tabs.Screen
        name="find-ticket"
        options={{
          title: t('navigation.tickets'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={fontSize(24)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: t('navigation.manage'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="manage-accounts" size={fontSize(24)} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}