import { auth } from './firebase.js';
import { createUser } from './firestore/users.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";

// Redirect logged-in users to dashboard
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = 'dashboard.html';
});

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = loginEmail.value;
  const password = loginPassword.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = 'dashboard.html';
  } catch (err) {
    alert(err.message);
  }
});

// REGISTER
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = registerUsername.value;
  const email = registerEmail.value;
  const password = registerPassword.value;
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await createUser(userCred.user.uid, { username, email });
    window.location.href = 'dashboard.html';
  } catch (err) {
    alert(err.message);
  }
});

// GOOGLE LOGIN
document.getElementById('googleLogin').addEventListener('click', async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    window.location.href = 'dashboard.html';
  } catch (err) {
    alert(err.message);
  }
});
