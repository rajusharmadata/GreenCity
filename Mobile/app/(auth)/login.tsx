import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../utils/api';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';
import { AuthContainer } from '../../components/auth/AuthContainer';
import { AuthInput } from '../../components/auth/AuthInput';
import { ButtonWithLoader } from '../../components/auth/ButtonWithLoader';
import '../../global.css';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!email?.trim() || !password) {
      return alert('Please fill all fields');
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email: email.trim(), password });
      const { user, token } = response.data.data;
      await SecureStore.setItemAsync('token', token);
      setUser(user, token);

      router.replace('/(tabs)');
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        (error.message === 'Network Error'
          ? "Cannot reach server. Check that the backend is running and you're on the same network."
          : 'Login failed');
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer
      title="Welcome back"
      subtitle="Log in to continue your green mission."
    >
      <AuthInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <AuthInput
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View className="mt-6">
        <ButtonWithLoader
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          label="Log in"
        />
      </View>

      <TouchableOpacity
        onPress={() => router.push('/register')}
        className="mt-6 py-3 items-center"
        activeOpacity={0.7}
      >
        <Text className="text-primary-dark font-medium">
          Don't have an account? <Text className="font-semibold">Sign up</Text>
        </Text>
      </TouchableOpacity>
    </AuthContainer>
  );
}
