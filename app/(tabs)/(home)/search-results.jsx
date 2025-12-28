import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import SearchResults from '../../../components/search/SearchResultsScreen';

export default function SearchResultsPage() {
  const params = useLocalSearchParams();

  return <SearchResults searchParams={params} />;
}