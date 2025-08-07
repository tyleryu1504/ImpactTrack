import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { collection, collectionGroup, query, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const userStatsDiv = document.getElementById('user-stats');
const globalStatsDiv = document.getElementById('global-stats');
const logoutButton = document.getElementById('logout');
const userEmailDisplay = document.getElementById('user-email');
let currentUser;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    currentUser = user;
    if (userEmailDisplay) {
      userEmailDisplay.textContent = user.email;
    }
    loadUserStats();
    loadGlobalStats();
  }
});

// FIX 3: Add proper logout functionality with redirect
logoutButton.addEventListener('click', () => {
  signOut(auth).then(() => {
    window.location.href = 'login.html';
  }).catch((error) => {
    console.error('Logout error:', error);
  });
});

function loadUserStats() {
  const q = query(collection(db, 'users', currentUser.uid, 'logs'));
  onSnapshot(q, (snapshot) => {
    const stats = { compostKg: 0, cleanupKg: 0, compostMinutes: 0, cleanupMinutes: 0 };
    snapshot.forEach((doc) => {
      const data = doc.data();
      const kg = Number(data.kg) || 0;
      const minutes = Number(data.minutes) || 0;
      if (data.type === 'compost') {
        stats.compostKg += kg;
        stats.compostMinutes += minutes;
      } else if (data.type === 'cleanup') {
        stats.cleanupKg += kg;
        stats.cleanupMinutes += minutes;
      }
    });
    userStatsDiv.innerHTML = `
      <h3>Your Stats</h3>
      <p>Compost: ${stats.compostKg} kg, ${stats.compostMinutes} min</p>
      <p>Cleanup: ${stats.cleanupKg} kg, ${stats.cleanupMinutes} min</p>
    `;
  }, (error) => {
    console.error('Error loading user stats:', error);
    userStatsDiv.innerHTML = '<p>Error loading your stats</p>';
  });
}

function loadGlobalStats() {
  const q = query(collectionGroup(db, 'logs'));
  onSnapshot(q, (snapshot) => {
    const stats = { compostKg: 0, cleanupKg: 0, compostMinutes: 0, cleanupMinutes: 0 };
    snapshot.forEach((doc) => {
      const data = doc.data();
      const kg = Number(data.kg) || 0;
      const minutes = Number(data.minutes) || 0;
      if (data.type === 'compost') {
        stats.compostKg += kg;
        stats.compostMinutes += minutes;
      } else if (data.type === 'cleanup') {
        stats.cleanupKg += kg;
        stats.cleanupMinutes += minutes;
      }
    });
    globalStatsDiv.innerHTML = `
      <h3>Global Stats</h3>
      <p>Total Compost: ${stats.compostKg} kg, ${stats.compostMinutes} min</p>
      <p>Total Cleanup: ${stats.cleanupKg} kg, ${stats.cleanupMinutes} min</p>
    `;
  }, (error) => {
    console.error('Error loading global stats:', error);
    globalStatsDiv.innerHTML = '<p>Error loading global stats</p>';
  });
}
