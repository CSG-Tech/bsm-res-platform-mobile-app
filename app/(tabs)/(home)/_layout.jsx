// app/(tabs)/(home)/_layout.tsx
import { Stack } from 'expo-router';

export default function HomeStack() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' }
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="search-results"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}