import { createElement, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function AuthLayout() {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace('/(tabs)');
    }
  }, [token]);

  return createElement(
    Stack,
    { screenOptions: { headerShown: false } },
    createElement(Stack.Screen, { name: 'login' }),
    createElement(Stack.Screen, { name: 'register' }),
    createElement(Stack.Screen, { name: 'verify-email' })
  );
}

