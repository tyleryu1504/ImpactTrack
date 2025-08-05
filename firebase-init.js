// public/firebase-init.js

// 1. Import the v9 modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// 2. TODO: Replace these with YOUR actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBBXlRU8GvhX6TiKA8Xr5odq5l-hEGmW7E",
  authDomain: "impact-track.firebaseapp.com",
  projectId: "impact-track",
  storageBucket: "impact-track.firebasestorage.app",
  messagingSenderId: "1052527193780",
  appId: "1:1052527193780:web:e9af5b190ce97d85cc71e1",
  measurementId: "G-ZQ3QZ8SHY7"
};

// 3. Initialize Firebase
const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// 4. Shared validators
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export function validatePassword(pw) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);
}
export function validateUsername(un) {
  return /^[A-Za-z0-9_]{3,20}$/.test(un);
}
