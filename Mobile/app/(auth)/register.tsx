import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../utils/api';
import "../../global.css";

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) return alert("Please fill all fields");
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      router.push({ pathname: '/verify-email', params: { email } });
    } catch (error: any) {
      alert(error.response?.data?.message || error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-6">
      <View className="mt-20">
        <Text className="text-4xl font-bold text-primary-dark mb-2">Join GreenCity 🌿</Text>
        <Text className="text-gray-600 mb-10 text-lg">Start your eco-friendly journey today.</Text>
        
        <View className="space-y-4">
          <View>
            <Text className="text-primary-dark font-semibold mb-2">Full Name</Text>
            <TextInput 
              className="bg-white border border-primary-light p-4 rounded-2xl"
              placeholder="Elon Musk"
              value={name}
              onChangeText={setName}
            />
          </View>

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
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-white text-center font-bold text-lg">Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text className="text-center text-primary-dark mt-4">Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
