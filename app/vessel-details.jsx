

import React from 'react';
import VesselDetailsScreen from '../components/VesselDetailsScreen'; // Import the component
import { useLocalSearchParams } from 'expo-router';

export default function VesselDetailsPage() {
  const params = useLocalSearchParams();

  return <VesselDetailsScreen route={{ params }} />;
}