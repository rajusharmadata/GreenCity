import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PermissionHandler from '@/src/components/PermissionHandler';
import Toast from 'react-native-toast-message';
import toastConfig from '@/src/components/ui/Toast';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { token, initializeAuth } = useAuthStore();
  const [showPerms, setShowPerms] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Initialize auth state from storage
        await initializeAuth();
        
        // Check permissions
        const granted = await AsyncStorage.getItem('permissions_granted');
        setShowPerms(!granted);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    })();
  }, [initializeAuth]);

  if (!isReady || showPerms === null) return null;

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
        <Stack.Screen
          name="eco-route-map"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>

      {showPerms && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
          <PermissionHandler onComplete={() => setShowPerms(false)} />
        </View>
      )}
      
      <Toast config={toastConfig} />
    </View>
  );
}
