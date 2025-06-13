import { auth } from '@/firebaseConfig';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // const handleLogin = () => {
  //   // TODO: Implement login logic
  //   console.log('Login:', { email, password });
  //   router.replace('/(tabs)');
  // };

  // const handleSignup = () => {
  //   router.push('/auth/signup');
  // };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user) {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred during login';
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      }
      Alert.alert('Login Error', errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSignup = () => {
    router.push('/auth/signup');
  }

  // const handleLogin = async () => {
  //   try {
  //     // Here you would typically make an API call to verify credentials
  //     // For demo purposes, we'll just store the email
  //     await AsyncStorage.setItem('userEmail', email);
  //     router.replace('/(tabs)');
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to login. Please try again.');
  //   }
  // };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-3xl font-bold text-center mb-8">Task Manager</Text>
      <View className="space-y-4">
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#666"
        />
        <TextInput
          className="w-full p-4 border text-black border-gray-300 rounded-lg"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666"
        />
        <TouchableOpacity
          className={`w-full p-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {/* <Text className="text-white text-center font-semibold">Login</Text> */}
          <Text className="text-white text-center font-semibold">
            {loading ? 'Signing in...' : 'Signin'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4"
          onPress={() => router.push('/auth/forgottenpass')}
        >
          <Text className="text-blue-500 text-center">Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mt-4"
          onPress={() => router.push('/auth/signup')}
        >
          <Text className="text-blue-500 text-center">Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 