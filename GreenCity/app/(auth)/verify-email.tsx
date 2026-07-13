import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../src/utils/api';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../src/store/authStore';
import { AuthContainer } from '../../src/components/auth/AuthContainer';
import { ButtonWithLoader } from '../../src/components/auth/ButtonWithLoader';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../../src/styles/theme';

export default function VerifyEmailScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const setUser = useAuthStore((state) => state.setUser);

  const email = typeof params.email === 'string' ? params.email : (params.email?.[0] ?? '');

  useEffect(() => {
    if (!email?.trim()) {
      router.replace('/register');
    }
  }, [email, router]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      return alert('Please enter the 6-digit code');
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-email', { email, otp });
      const { user, token } = response.data.data;

      await SecureStore.setItemAsync('token', token);
      setUser(user, token);
      router.replace('/(tabs)');
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Verification failed. Check the code and try again.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email?.trim()) return;
    setResendLoading(true);
    try {
      await api.post('/auth/resend-verification', { email });
      alert('A new code was sent to your email.');
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Could not resend code. Try again in a minute.';
      alert(msg);
    } finally {
      setResendLoading(false);
    }
  };

  if (!email?.trim()) {
    return null;
  }

  return (
    <AuthContainer
      title="Check your email"
      subtitle={`We sent a 6-digit code to ${email}. Enter it below.`}
    >
      <View style={styles.codeInputContainer}>
        <Text style={styles.codeLabel}>Verification code</Text>
        <TextInput
          placeholder="000000"
          placeholderTextColor={Colors.neutral[400]}
          style={styles.codeInput}
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(t) => setOtp(t.replace(/\D/g, ''))}
        />
      </View>

      <View style={styles.actionContainer}>
        <ButtonWithLoader
          onPress={handleVerify}
          loading={loading}
          disabled={loading || otp.length !== 6}
          label="Verify and continue"
        />
      </View>

      <TouchableOpacity
        onPress={handleResend}
        disabled={resendLoading}
        style={styles.resendButton}
        activeOpacity={0.7}
      >
        {resendLoading ? (
          <Text style={styles.resendTextLoading}>Sending new code...</Text>
        ) : (
          <Text style={styles.resendText}>
            Didn't get the code? <Text style={styles.resendTextBold}>Resend</Text>
          </Text>
        )}
      </TouchableOpacity>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  codeInputContainer: {
    marginBottom: Spacing.md,
  },
  codeLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary[900],
    marginBottom: Spacing.sm,
  },
  codeInput: {
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.primary[100],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes['2xl'],
    color: Colors.primary[900],
    textAlign: 'center',
    letterSpacing: 6,
    fontWeight: FontWeights.semibold,
  },
  actionContainer: {
    marginTop: Spacing.lg,
  },
  resendButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    opacity: 0.9,
  },
  resendText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    color: Colors.primary[900],
  },
  resendTextBold: {
    fontWeight: FontWeights.semibold,
  },
  resendTextLoading: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    color: Colors.primary[900],
  },
});
