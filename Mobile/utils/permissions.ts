import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const requestAllPermissions = async () => {
  const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
  const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
  
  let notificationsStatus = 'undetermined';
  if (!isExpoGo) {
    try {
      // Dynamic import to prevent crash on require in Expo Go SDK 53+
      const Notifications = require('expo-notifications');
      const res = await Notifications.requestPermissionsAsync();
      notificationsStatus = res.status;
    } catch (e) {
      console.warn('Notifications not supported');
    }
  }

  let mediaStatus = 'undetermined';
  try {
    const res = await MediaLibrary.requestPermissionsAsync();
    mediaStatus = res.status;
  } catch (e) {
    console.warn('Media Library permissions rejected or not supported');
  }
  
  return { 
    location: locationStatus === 'granted', 
    camera: cameraStatus === 'granted', 
    notifications: notificationsStatus === 'granted', 
    mediaLibrary: mediaStatus === 'granted' 
  };
};

export const startLocationTracking = async () => {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status === 'granted') {
    return await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  }
  return null;
};
