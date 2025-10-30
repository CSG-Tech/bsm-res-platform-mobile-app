import React from 'react';
import SearchResults from '../components/SearchResultsScreen'; 
import { useLocalSearchParams } from 'expo-router';

export default function SearchResultsPage() {
  const params = useLocalSearchParams();

  return <SearchResults searchParams={params} />;
}