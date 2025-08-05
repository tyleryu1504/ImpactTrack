// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

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
export const auth = getAuth(app);
export const db = getFirestore(app);
