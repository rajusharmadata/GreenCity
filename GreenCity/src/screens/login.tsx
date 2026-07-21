import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '../hooks/api/useApi';
import { useAuthStore } from '../store/authStore';
import { AuthContainer } from '../components/auth/AuthContainer';
import { AuthInput } from '../components/auth/AuthInput';
import { ButtonWithLoader } from '../components/auth/ButtonWithLoader';
import { Colors, Spacing, FontSizes, FontWeights } from '../styles/theme';
import { showErrorToast, showSuccessToast } from '../components/ui/Toast';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { post } = useApi();
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!email?.trim() || !password) {
      showErrorToast('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await post('/auth/login', { email: email.trim(), password }, { showToast: false });
      if (response?.data) {
        const { user, token } = response.data;
        await setUser(user, token);
        showSuccessToast('Login successful!');
        router.replace('/(tabs)');
      }
    } catch (error) {
      // Error is already handled by useApi hook
      console.error('Login error:', error);
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
          {"Don't have an account? "}<Text style={styles.signupTextBold}>Sign up</Text>
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
