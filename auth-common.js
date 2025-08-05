// public/auth-common.js

import { auth, db, validateEmail, validatePassword, validateUsername } from "./firebase-init.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

export function initAuth({ onLogin, onLogout }) {
  const authSection   = document.getElementById("auth-section");
  const appSection    = document.getElementById("app-section");
  const authMsg       = document.getElementById("auth-msg");
  const googleBtn     = document.getElementById("google-btn");
  const loginBtn      = document.getElementById("login-btn");
  const signupBtn     = document.getElementById("signup-btn");
  const logoutBtn     = document.getElementById("logout-btn");
  const emailInput    = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput  = document.getElementById("password-confirm");
  const usernameInput = document.getElementById("username");
  let  isSignupMode   = false;
  const provider      = new GoogleAuthProvider();

  function showMessage(msg, isError = true) {
    authMsg.textContent      = msg;
    authMsg.style.color      = isError ? "red" : "green";
  }
  function toggleMode() {
    isSignupMode = !isSignupMode;
    confirmInput.style.display = isSignupMode ? "block" : "none";
    usernameInput.style.display = isSignupMode ? "block" : "none";
    loginBtn.textContent    = isSignupMode ? "Back to Login" : "Login";
    signupBtn.textContent   = isSignupMode ? "Create Account" : "Sign Up";
  }

  // Listen to auth state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Hide login, show app
      authSection.style.display = "none";
      appSection.style.display  = "block";

      // Ensure Firestore user doc
      const udoc = doc(db, "users", user.uid);
      const snap = await getDoc(udoc);
      if (!snap.exists()) {
        // new Google sign-in, ask for username
        let un = prompt("Choose a username (3–20 letters/numbers/_):");
        while (!validateUsername(un)) {
          un = prompt("Invalid. Username must be 3–20 chars, letters/numbers/_. Try again:");
        }
        await setDoc(udoc, {
          uid: user.uid,
          email: user.email,
          username: un,
          createdAt: serverTimestamp(),
          following: [],
          blocked: []
        });
      }
      onLogin?.(user);
    } else {
      // Show login, hide app
      authSection.style.display = "block";
      appSection.style.display  = "none";
      onLogout?.();
    }
  });

  // Google button
  googleBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
      showMessage("Logged in!", false);
    } catch (e) {
      showMessage(e.message);
    }
  });

  // Login button
  loginBtn.addEventListener("click", async () => {
    if (isSignupMode) { toggleMode(); return; }
    const email = emailInput.value.trim();
    const pw    = passwordInput.value;
    if (!validateEmail(email))       return showMessage("Enter a valid email.");
    if (!pw)                         return showMessage("Enter your password.");
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      showMessage("Logged in!", false);
    } catch (e) {
      showMessage(e.code === "auth/wrong-password" ? "Wrong password." : e.message);
    }
  });

  // Signup button
  signupBtn.addEventListener("click", async () => {
    if (!isSignupMode) { toggleMode(); return; }
    const email = emailInput.value.trim();
    const pw    = passwordInput.value;
    const pw2   = confirmInput.value;
    const un    = usernameInput.value.trim();
    if (!validateEmail(email))        return showMessage("Enter a valid email.");
    if (!validateUsername(un))        return showMessage("Invalid username.");
    if (!validatePassword(pw))        return showMessage("Password must be ≥8 chars, include upper, lower & number.");
    if (pw !== pw2)                   return showMessage("Passwords do not match.");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email,
        username: un,
        createdAt: serverTimestamp(),
        following: [],
        blocked: []
      });
      showMessage("Account created! Please log in.", false);
      toggleMode();
    } catch (e) {
      showMessage(e.code === "auth/email-already-in-use" ? "Email already in use." : e.message);
    }
  });

  // Logout
  logoutBtn.addEventListener("click", () => signOut(auth));
}
