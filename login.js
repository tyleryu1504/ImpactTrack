import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const emailLoginForm = document.getElementById('email-login');
const registerButton = document.getElementById('register');
const googleButton = document.getElementById('google-login');

emailLoginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
});

registerButton.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
});

googleButton.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    alert(err.message);
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'index.html';
  }
});
