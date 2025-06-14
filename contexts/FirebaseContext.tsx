import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

interface FirebaseContextType {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  isInitialized: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  db: null,
  auth: null,
  isInitialized: false,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      // Initialize Firebase
      const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      const firebaseAuth = getAuth(firebaseApp);
      const firebaseDb = getFirestore(firebaseApp);

      setApp(firebaseApp);
      setAuth(firebaseAuth);
      setDb(firebaseDb);

      // Listen for auth state changes
      const unsubscribe = firebaseAuth.onAuthStateChanged(() => {
        setIsInitialized(true);
      });

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      setIsInitialized(true); // Set to true even on error to prevent infinite loading
    }
  }, []);

  const value = {
    app,
    auth,
    db,
    isInitialized,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
} 