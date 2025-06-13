import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/theme';

const auth = getAuth();

const ForgottenPass = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleSubmit = async () => {
    if (!email) {
      alert('Please enter your email address')
      return
    }
    
    setIsLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      alert('Password reset instructions have been sent to your email')
      router.back()
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Reset Password</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.description, { color: theme.secondary }]}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text
              }]}
              placeholder="Email address"
              placeholderTextColor={theme.secondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.button, 
              { backgroundColor: theme.primary },
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default ForgottenPass