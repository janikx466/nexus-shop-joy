import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Default Firebase configuration
const defaultConfig = {
  apiKey: "AIzaSyBSwAYozBnPZsNczvp6P-J_DLv28ifczmM",
  authDomain: "foxo-services.firebaseapp.com",
  projectId: "foxo-services",
  storageBucket: "foxo-services.firebasestorage.app",
  messagingSenderId: "1050096262408",
  appId: "1:1050096262408:web:a5f56b9e89df6daf4c60bd"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

const initializeFirebase = () => {
  // Check for custom config in localStorage
  const customConfig = localStorage.getItem('firebaseConfig');
  const config = customConfig ? JSON.parse(customConfig) : defaultConfig;

  if (!getApps().length) {
    app = initializeApp(config);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  db = getFirestore(app);

  return { app, auth, db };
};

// Initialize on load
const { app: firebaseApp, auth: firebaseAuth, db: firebaseDb } = initializeFirebase();

export { firebaseApp as app, firebaseAuth as auth, firebaseDb as db };
export { initializeFirebase };
