

import React from 'react';
import VesselDetailsScreen from '../components/vessel-details/VesselDetailsScreen'; // Import the component
import { useLocalSearchParams } from 'expo-router';

export default function VesselDetailsPage() {
  const params = useLocalSearchParams();

  return <VesselDetailsScreen route={{ params }} />;
}