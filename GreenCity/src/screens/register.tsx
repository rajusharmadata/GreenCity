import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '../hooks/api/useApi';
import { AuthContainer } from '../components/auth/AuthContainer';
import { AuthInput } from '../components/auth/AuthInput';
import { ButtonWithLoader } from '../components/auth/ButtonWithLoader';
import { Colors, Spacing, FontSizes, FontWeights } from '../styles/theme';
import { showErrorToast, showSuccessToast } from '../components/ui/Toast';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { post } = useApi();

  const handleRegister = async () => {
    if (!name?.trim() || !email?.trim() || !password) {
      showErrorToast('Please fill all fields');
      return;
    }
    if (password.length < 6) {
      showErrorToast('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      }, { showToast: false });
      
      if (response?.data) {
        const emailForVerify = (response.data?.user?.email || email.trim()).toString();
        showSuccessToast('Account created! Please verify your email.');
        router.push({
          pathname: '/verify-email',
          params: { email: emailForVerify },
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer
      title="Create account"
      subtitle="Start your eco-friendly journey today."
    >
      <AuthInput
        label="Full name"
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
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
        label="Password (min 6 characters)"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.actionContainer}>
        <ButtonWithLoader
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          label="Create account"
        />
      </View>

      <TouchableOpacity
        onPress={() => router.push('/login')}
        style={styles.loginButton}
        activeOpacity={0.7}
      >
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginTextBold}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    marginTop: Spacing.lg,
  },
  loginButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  loginText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    color: Colors.primary[900],
  },
  loginTextBold: {
    fontWeight: FontWeights.semibold,
  },
});
