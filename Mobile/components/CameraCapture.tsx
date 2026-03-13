import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface CameraCaptureProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-black p-6">
        <Text className="text-white text-center mb-6 text-lg">We need your permission to show the camera</Text>
        <TouchableOpacity className="bg-primary p-4 rounded-xl" onPress={requestPermission}>
          <Text className="text-white font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      setPhoto(data.uri);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {photo ? (
        <View className="flex-1">
          <Image source={{ uri: photo }} className="flex-1" />
          <View className="absolute bottom-10 flex-row justify-around w-full px-10">
            <TouchableOpacity className="bg-white/20 p-5 rounded-full blur-sm" onPress={() => setPhoto(null)}>
              <Ionicons name="refresh" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-primary p-5 rounded-full shadow-lg" onPress={() => onCapture(photo)}>
              <Ionicons name="checkmark" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView style={{ flex: 1 }} ref={cameraRef}>
          <View className="flex-1 justify-between p-10">
            <TouchableOpacity onPress={onClose} className="bg-black/30 w-12 h-12 rounded-full items-center justify-center">
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <View className="items-center">
              <TouchableOpacity onPress={takePicture} className="w-20 h-20 bg-white rounded-full border-4 border-primary p-1">
                <View className="w-full h-full bg-white rounded-full border border-gray-300" />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      )}
    </View>
  );
}
