import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PermissionHandler from '../components/PermissionHandler';
import "../global.css";

export default function RootLayout() {
  const { token } = useAuthStore();
  const [showPerms, setShowPerms] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const granted = await AsyncStorage.getItem('permissions_granted');
      setShowPerms(!granted);
    })();
  }, []);

  if (showPerms === null) return null;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="report-detail"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="leaderboard"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="badges"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
      </Stack>

      {showPerms && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
          <PermissionHandler onComplete={() => setShowPerms(false)} />
        </View>
      )}
    </View>
  );
}
