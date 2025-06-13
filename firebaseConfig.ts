// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3RloCN1JeLO195xd-SgTrO_5_9QMJ_lk",
  authDomain: "campusbuddy-2025.firebaseapp.com",
  projectId: "campusbuddy-2025",
  storageBucket: "campusbuddy-2025.firebasestorage.app",
  messagingSenderId: "522355327679",
  appId: "1:522355327679:web:723647832592779c857c0a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})
export const db = getFirestore(app)
export const storage = getStorage(app)