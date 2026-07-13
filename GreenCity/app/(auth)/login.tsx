import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../src/utils/api';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../src/store/authStore';
import { AuthContainer } from '../../src/components/auth/AuthContainer';
import { AuthInput } from '../../src/components/auth/AuthInput';
import { ButtonWithLoader } from '../../src/components/auth/ButtonWithLoader';
import { Colors, Spacing, FontSizes, FontWeights } from '../../src/styles/theme';

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

      <View style={styles.actionContainer}>
        <ButtonWithLoader
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          label="Log in"
        />
      </View>

      <TouchableOpacity
        onPress={() => router.push('/register')}
        style={styles.signupButton}
        activeOpacity={0.7}
      >
        <Text style={styles.signupText}>
          Don't have an account? <Text style={styles.signupTextBold}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    marginTop: Spacing.lg,
  },
  signupButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  signupText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    color: Colors.primary[900],
  },
  signupTextBold: {
    fontWeight: FontWeights.semibold,
  },
});
