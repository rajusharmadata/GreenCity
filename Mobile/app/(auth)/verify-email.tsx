import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';
import { AuthContainer } from '../../components/auth/AuthContainer';
import { ButtonWithLoader } from '../../components/auth/ButtonWithLoader';
import '../../global.css';

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
      <View className="mb-4">
        <Text className="text-primary-dark font-semibold mb-2 text-sm">Verification code</Text>
        <TextInput
          placeholder="000000"
          placeholderTextColor="#9ca3af"
          className="bg-white border border-primary-light rounded-2xl px-4 py-4 text-center text-2xl tracking-[0.4em] text-primary-dark font-semibold"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(t) => setOtp(t.replace(/\D/g, ''))}
        />
      </View>

      <View className="mt-6">
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
        className="mt-6 py-3 items-center opacity-90"
        activeOpacity={0.7}
      >
        {resendLoading ? (
          <Text className="text-primary-dark font-medium">Sending new code...</Text>
        ) : (
          <Text className="text-primary-dark font-medium">
            Didn't get the code? <Text className="font-semibold">Resend</Text>
          </Text>
        )}
      </TouchableOpacity>
    </AuthContainer>
  );
}
