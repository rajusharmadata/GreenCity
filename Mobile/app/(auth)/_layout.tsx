import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';

export default function AuthLayout() {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace('/(tabs)');
    }
  }, [token]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}

