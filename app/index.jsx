import React from 'react';
import BookingScreen from '../components/booking/booking';
import SearchResultsScreen from '../components/search/SearchResultsScreen';
import ReservationScreen from '../components/reservation/ReservationScreen';
import PaymentScreen from '../components/payment/PaymentScreen';

export default function HomeScreen() {
  // return <ReservationScreen/>
  // return <PaymentScreen/>
  return <BookingScreen />;
}