// firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAFisO1R46bjzZOfpMwlNdkqN8uegUfk0s",
  authDomain: "riglii-freelance.firebaseapp.com",
  projectId: "riglii-freelance",
  storageBucket: "riglii-freelance.firebasestorage.app",
  messagingSenderId: "1088230150217",
  appId: "1:1088230150217:web:d6d09bc64b1c3c642d6f98",
  measurementId: "G-1NMMS6SXZK"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };