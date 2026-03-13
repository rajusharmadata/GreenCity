import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../utils/api';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';
import "../../global.css";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);

  const handleLogin = async () => {
    if (!email || !password) return alert("Please fill all fields");
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      await SecureStore.setItemAsync('token', token);
      setUser(user, token);
      
      router.replace('/(tabs)');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || (error.message === "Network Error" ? "Network Error: Cannot reach backend. check if backend is running on your computer's IP." : "Login failed");
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-6">
      <View className="mt-20">
        <Text className="text-4xl font-bold text-primary-dark mb-2">Welcome Back 👋</Text>
        <Text className="text-gray-600 mb-10 text-lg">Log in to continue your green mission.</Text>
        
        <View className="space-y-4">
          <View>
            <Text className="text-primary-dark font-semibold mb-2">Email Address</Text>
            <TextInput 
              className="bg-white border border-primary-light p-4 rounded-2xl"
              placeholder="elon@mars.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text className="text-primary-dark font-semibold mb-2">Password</Text>
            <TextInput 
              className="bg-white border border-primary-light p-4 rounded-2xl"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            className={`bg-primary p-5 rounded-2xl mt-6 shadow-lg ${loading ? 'opacity-50' : ''}`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-center font-bold text-lg">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text className="text-center text-primary-dark mt-4">Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
