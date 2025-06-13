import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userEmail');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-6">
        <Text className="text-2xl font-bold mb-6">Settings</Text>

        <View className="space-y-6">
          {/* Notifications Section */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold mb-4">Notifications</Text>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-600">Task Reminders</Text>
              <Switch value={true} />
            </View>
            {/* <View className="flex-row items-center justify-between">
              <Text className="text-gray-600">Daily Summary</Text>
              <Switch value={false} />
            </View> */}
          </View>

          {/* Appearance Section */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold mb-4">Appearance</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600">Dark Mode</Text>
              <Switch value={false} />
            </View>
          </View>

          {/* Account Section */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold mb-4">Account</Text>
            <TouchableOpacity className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-600">Edit Profile</Text>
              <FontAwesome name="chevron-right" size={16} color="#6b7280" />
            </TouchableOpacity>
            {/* <TouchableOpacity className="flex-row items-center justify-between">
              <Text className="text-gray-600">Change Password</Text>
              <FontAwesome name="chevron-right" size={16} color="#6b7280" />
            </TouchableOpacity> */}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="bg-red-500 p-4 rounded-lg"
            onPress={handleLogout}
          >
            <Text className="text-white text-center font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 