import { auth, db, validateEmail, validatePassword, validateUsername }
  from './firebase-init.js';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

import { doc, getDoc, setDoc } 
  from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

import {
  searchUsers,
  followUser,
  blockUser,
  isUsernameAvailable
} from './firestore/users.js';

import { incrementUserCount } from './firestore/stats.js';

// Redirect to login if not signed in
export function requireAuth() {
  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = 'index.html';
    }
  });
}

// Redirect to dashboard if already signed in
export function redirectIfLoggedIn() {
  onAuthStateChanged(auth, user => {
    if (user) {
      window.location.href = 'user-dashboard.html';
    }
  });
}

// Render top‐of‐page navigation on protected pages
export function setupNav() {
  const nav = document.createElement('nav');
  nav.innerHTML = `
    <ul class="nav-list">
      <li><a href="user-dashboard.html">My Dashboard</a></li>
      <li><a href="global-dashboard.html">Global Stats</a></li>
      <li><a href="inbox.html">Inbox</a></li>
      <li><button id="logout-btn">Logout</button></li>
    </ul>
  `;
  document.body.insertBefore(nav, document.body.firstChild);

  document
    .getElementById('logout-btn')
    .addEventListener('click', async () => {
      await signOut(auth);
      window.location.href = 'index.html';
    });
}

export async function signUp(username, email, password) {
  if (!validateUsername(username)) throw new Error('Invalid username');
  if (!validateEmail(email))       throw new Error('Invalid email');
  if (!validatePassword(password)) throw new Error('Weak password');
  if (!(await isUsernameAvailable(username)))
    throw new Error('Username taken');

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    username,
    username_lowercase: username.toLowerCase(),
    email
  });
  await incrementUserCount();
  window.location.href = 'user-dashboard.html';
}

export async function logIn(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
  window.location.href = 'user-dashboard.html';
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result   = await signInWithPopup(auth, provider);
  await ensureUsername(result.user);
  window.location.href = 'user-dashboard.html';
}

export async function ensureUsername(user) {
  const ref  = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().username) return;

  let username = '';
  do {
    username = prompt('Choose a username (3–20 letters/numbers/_):') || '';
  } while (!validateUsername(username) || !(await isUsernameAvailable(username)));

  await setDoc(
    ref,
    {
      username,
      username_lowercase: username.toLowerCase(),
      email: user.email
    },
    { merge: true }
  );
  if (!snap.exists()) {
    await incrementUserCount();
  }
}

export function setupSearchBar() {
  const input   = document.getElementById('user-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  input.addEventListener('change', async () => {
    results.innerHTML = '';
    const term = input.value.trim().toLowerCase();
    if (!term) return;

    const users = await searchUsers(term);
    users.forEach(u => {
      const div       = document.createElement('div');
      div.textContent = u.username;

      const followBtn = document.createElement('button');
      followBtn.textContent = 'Follow';
      followBtn.onclick = () => followUser(u.uid);

      const blockBtn = document.createElement('button');
      blockBtn.textContent = 'Block';
      blockBtn.onclick = () => blockUser(u.uid);

      div.appendChild(followBtn);
      div.appendChild(blockBtn);
      results.appendChild(div);
    });
  });
}
