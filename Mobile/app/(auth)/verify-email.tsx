import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';
import "../../global.css";

export default function VerifyEmailScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const setUser = useAuthStore(state => state.setUser);

  const handleVerify = async () => {
    if (otp.length !== 6) return alert("Enter 6-digit OTP");
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-email', { email, otp });
      const { user, token } = response.data;
      
      await SecureStore.setItemAsync('token', token);
      setUser(user, token);
      
      router.replace('/(tabs)');
    } catch (error: any) {
      alert(error.response?.data?.message || error.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-6">
      <View className="mt-20">
        <Text className="text-4xl font-bold text-primary-dark mb-2">Check Your Email 📧</Text>
        <Text className="text-gray-600 mb-10 text-lg">We sent a 6-digit code to {email}.</Text>
        
        <View className="space-y-4">
          <View>
            <Text className="text-primary-dark font-semibold mb-2">Verification Code</Text>
            <TextInput 
              className="bg-white border border-primary-light p-4 rounded-2xl text-center text-3xl tracking-widest"
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />
          </View>

          <TouchableOpacity 
            className={`bg-primary p-5 rounded-2xl mt-6 shadow-lg ${loading ? 'opacity-50' : ''}`}
            onPress={handleVerify}
            disabled={loading}
          >
            <Text className="text-white text-center font-bold text-lg">Verify & Start</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => api.post('/auth/resend-otp', { email })}>
            <Text className="text-center text-primary-dark mt-4">Didn't receive code? Resend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
