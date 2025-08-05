import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";

// Placeholder Firebase configuration - replace with your project's config values
const firebaseConfig = {
  apiKey: "AIzaSyBBXlRU8GvhX6TiKA8Xr5odq5l-hEGmW7E",
  authDomain: "impact-track.firebaseapp.com",
  projectId: "impact-track",
  storageBucket: "impact-track.firebasestorage.app",
  messagingSenderId: "1052527193780",
  appId: "1:1052527193780:web:e9af5b190ce97d85cc71e1",
  measurementId: "G-ZQ3QZ8SHY7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export services and timestamp helper
export { auth, db, serverTimestamp };
