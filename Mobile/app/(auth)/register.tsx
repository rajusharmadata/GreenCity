import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../utils/api';
import { AuthContainer } from '../../components/auth/AuthContainer';
import { AuthInput } from '../../components/auth/AuthInput';
import { ButtonWithLoader } from '../../components/auth/ButtonWithLoader';
import '../../global.css';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name?.trim() || !email?.trim() || !password) {
      return alert('Please fill all fields');
    }
    if (password.length < 6) {
      return alert('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      const emailForVerify = (response.data?.data?.user?.email || email.trim()).toString();

      router.push({
        pathname: '/verify-email',
        params: { email: emailForVerify },
      });
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Registration failed. Check your details and try again.';
      alert(msg);
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

      <View className="mt-6">
        <ButtonWithLoader
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          label="Create account"
        />
      </View>

      <TouchableOpacity
        onPress={() => router.push('/login')}
        className="mt-6 py-3 items-center"
        activeOpacity={0.7}
      >
        <Text className="text-primary-dark font-medium">
          Already have an account? <Text className="font-semibold">Log in</Text>
        </Text>
      </TouchableOpacity>
    </AuthContainer>
  );
}
