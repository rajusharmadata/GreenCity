import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../utils/api';
import "../../global.css";

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // 1. Refresh user data for latest points/stats
      const userRes = await api.get('/auth/me');
      setUser(userRes.data.data.user, null); // Keep existing token


      // 2. Fetch latest issues
      const issuesRes = await api.get('/issues?limit=5');
      setIssues(issuesRes.data.issues || []);
    } catch (error) {
      console.error('Dashboard Fetch Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={['#14532d', '#16a34a', '#22c55e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-8 pb-16 rounded-b-[50px] shadow-2xl"
      >
        <View className="flex-row justify-between items-center mt-10">
          <View>
            <Text className="text-green-100 text-sm font-medium tracking-wider uppercase">Welcome back</Text>
            <Text className="text-white text-3xl font-bold mt-1">{user?.name || 'Eco Warrior'}</Text>
          </View>
          <TouchableOpacity className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Glassmorphic Points Card */}
        <View className="bg-white/10 mt-8 p-6 rounded-[32px] border border-white/20 flex-row justify-between items-center backdrop-blur-lg">
          <View>
            <Text className="text-white/80 text-xs font-semibold uppercase">Impact Points</Text>
            <Text className="text-white text-4xl font-black mt-1 italic">{user?.points || 0}</Text>
          </View>
          <View className="bg-amber-400 p-4 rounded-3xl shadow-lg rotate-12">
            <Ionicons name="flash" size={32} color="white" />
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between mt-10 px-2">
          <StatItem value={user?.reportsCount?.toString() || "0"} label="Reports" />
          <StatItem value={`${(user?.reportsCount || 0) * 5}kg`} label="CO2 Saved" />
          <StatItem value={((user?.points || 0) / 100).toFixed(1)} label="Eco Rank" />
        </View>
      </LinearGradient>

      {/* Main Content Areas */}
      <View className="px-6 -mt-10">
        <View className="flex-row space-x-4">
          <ActionCard 
            icon="camera" 
            title="Report" 
            color="#16a34a" 
            desc="AI Analysis"
            onPress={() => router.push('/(tabs)/report')}
          />
          <ActionCard 
            icon="leaf" 
            title="Eco Routes" 
            color="#0ea5e9" 
            desc="Save CO2"
            onPress={() => router.push('/(tabs)/eco-routes')}
          />
        </View>

        {/* Active Challenges Section */}
        <Text className="text-gray-800 text-xl font-black mt-10 mb-5">Challenges</Text>
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          className="p-6 rounded-[40px] border border-green-100 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-amber-100 p-3 rounded-2xl">
                <Ionicons name="trophy" size={24} color="#f59e0b" />
              </View>
              <View className="ml-4">
                <Text className="text-gray-900 font-bold text-lg">Weekly Goal</Text>
                <Text className="text-gray-400 text-xs">Reach 100 points</Text>
              </View>
            </View>
            <Text className="text-green-600 font-bold">+50 pts</Text>
          </View>
          
          <View className="h-2 bg-gray-100 rounded-full mt-2">
            <View className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(((user?.points || 0) % 100), 100)}%` }} />
          </View>
        </LinearGradient>

        {/* Nearby Issues Micro-Feed */}
        <View className="flex-row justify-between items-center mt-10 mb-5">
          <Text className="text-gray-800 text-xl font-black">Community Activity</Text>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/community')}
          >
            <Text className="text-green-600 font-bold">See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#16a34a" className="mt-4" />
        ) : issues.length === 0 ? (
          <Text className="text-gray-400 text-center mt-4 italic">No reports yet in your community.</Text>
        ) : (
          issues.map((issue, i) => (
            <TouchableOpacity
              key={issue._id}
              className="bg-white p-4 rounded-[32px] mb-4 shadow-sm flex-row items-center border border-gray-50"
              onPress={() => router.push(`/report-detail?id=${issue._id}`)}
              activeOpacity={0.8}
            >
              <Image 
                source={{ uri: issue.image || `https://picsum.photos/200/200?random=${i}` }} 
                className="w-20 h-20 rounded-2xl bg-gray-100"
              />
              <View className="flex-1 ml-4">
                <Text className="text-gray-900 font-bold text-md" numberOfLines={1}>{issue.title || 'Untitled Issue'}</Text>
                <Text className="text-gray-400 text-xs mt-1">{issue.address || 'Location Unknown'}</Text>
                <View className="flex-row items-center mt-2">
                  <View className={`px-3 py-1 rounded-full ${issue.status === 'Resolved' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Text className={`text-[10px] font-black uppercase ${issue.status === 'Resolved' ? 'text-green-600' : 'text-orange-600'}`}>
                      {issue.status}
                    </Text>
                  </View>
                  <Text className="text-gray-300 text-[10px] ml-3 uppercase font-bold">{issue.category}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))
        )}
      </View>
      <View className="h-20" />
    </ScrollView>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <View className="items-center">
      <Text className="text-white text-2xl font-black">{value}</Text>
      <Text className="text-green-100 text-[11px] font-medium uppercase tracking-tighter">{label}</Text>
    </View>
  );
}

function ActionCard({ icon, title, color, desc, onPress }: any) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-1 bg-white p-6 rounded-[40px] shadow-lg border border-gray-50 items-center overflow-hidden"
    >
      <LinearGradient
        colors={[`${color}20`, `${color}05`]}
        className="absolute inset-0"
      />
      <View className="p-4 rounded-3xl mb-3" style={{ backgroundColor: `${color}15` }}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <Text className="text-gray-900 font-black text-lg">{title}</Text>
      <Text className="text-gray-400 text-[10px] font-medium uppercase">{desc}</Text>
    </TouchableOpacity>
  );
}
