import { auth, db } from '@/firebaseConfig';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, 'user', userCredential.user?.uid, 'userNames'), {
        name: name,
        email: email,
        userId: userCredential.user?.uid
      });
      if (userCredential.user) {
        // TODO: Update user profile with name
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred during signup';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      Alert.alert('Signup Error', errorMessage);
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  // const handleSignup = async () => {
  //   try {
  //     // Here you would typically make an API call to create the account
  //     // For demo purposes, we'll just store the email
  //     await AsyncStorage.setItem('userEmail', email);
  //     router.replace('/(tabs)');
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to create account. Please try again.');
  //   }
  // };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-3xl font-bold text-center mb-8">Create Account</Text>
      <View className="space-y-4">
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg"
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#666"
        />
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
          className="w-full p-4 border border-gray-300 rounded-lg"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          placeholderTextColor="#666"
        />
        <TouchableOpacity
          className={`w-full p-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
          onPress={handleSignup}
          disabled={loading}
        >
          {/* <Text className="text-white text-center font-semibold">Sign Up</Text> */}
          <Text className="text-white text-center font-semibold">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mt-4"
          onPress={() => router.push('/auth/login')}
        >
          <Text className="text-blue-500 text-center">Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 