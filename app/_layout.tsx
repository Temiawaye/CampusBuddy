import { AuthProvider } from '@/context/auth';
import { RefreshProvider } from '@/context/RefreshContext';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from './context/ThemeContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RefreshProvider>
        <ThemeProvider>
          <SafeAreaView className="flex-1">
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="tasks" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth/forgottenpass" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="light" />
          </SafeAreaView>
        </ThemeProvider>
      </RefreshProvider>
    </AuthProvider>
  );
}
