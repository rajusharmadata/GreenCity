import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { requestAllPermissions } from '../utils/permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function PermissionHandler({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleGrant = async () => {
    setLoading(true);
    await requestAllPermissions();
    await AsyncStorage.setItem('permissions_granted', 'true');
    setLoading(false);
    onComplete();
  };

  return (
    <View className="flex-1 bg-white p-8">
      <View className="mt-20 items-center">
        <View className="bg-primary-light p-6 rounded-full mb-6">
            <Ionicons name="leaf" size={60} color="#16a34a" />
        </View>
        <Text className="text-3xl font-bold text-primary-dark text-center">Ready to go Green? 🌿</Text>
        <Text className="text-gray-500 text-center mt-4 text-lg">To provide the best experience, GreenCity needs a few permissions:</Text>
      </View>

      <ScrollView className="mt-10 space-y-6">
        <PermissionItem 
            icon="location" 
            title="Location" 
            desc="To auto-detect issues near you and find eco routes" 
        />
        <PermissionItem 
            icon="camera" 
            title="Camera" 
            desc="To capture and report city issues instantly" 
        />
        <PermissionItem 
            icon="notifications" 
            title="Notifications" 
            desc="Get updates when your reports are resolved" 
        />
      </ScrollView>

      <TouchableOpacity 
        className="bg-primary p-6 rounded-3xl mt-10 shadow-lg"
        onPress={handleGrant}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold text-xl">Grant Permissions & Start</Text>
      </TouchableOpacity>
    </View>
  );
}

function PermissionItem({ icon, title, desc }: any) {
  return (
    <View className="flex-row items-center space-x-4 mb-4">
        <View className="bg-gray-50 p-3 rounded-2xl">
            <Ionicons name={icon} size={24} color="#16a34a" />
        </View>
        <View className="flex-1 ml-4">
            <Text className="font-bold text-primary-dark text-lg">{title}</Text>
            <Text className="text-gray-400 text-sm">{desc}</Text>
        </View>
    </View>
  );
}
