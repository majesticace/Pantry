// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhQRanmOZjQvCQDHfEbGtElAz9GMlvahM",
  authDomain: "pantry-4a4de.firebaseapp.com",
  projectId: "pantry-4a4de",
  storageBucket: "pantry-4a4de.appspot.com",
  messagingSenderId: "663237997108",
  appId: "1:663237997108:web:86609baf472fb7d1561061",
  measurementId: "G-RNCQVFCPQZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const firestore = getFirestore(app);

export { firestore };
export const auth = getAuth(app);
