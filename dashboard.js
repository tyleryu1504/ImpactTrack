import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { collection, query, where, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

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

logoutButton.addEventListener('click', () => signOut(auth));

function loadUserStats() {
  const q = query(collection(db, 'activities'), where('userId', '==', currentUser.uid));
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
    userStatsDiv.textContent = `Compost: ${stats.compostKg} kg, ${stats.compostMinutes} min | Cleanup: ${stats.cleanupKg} kg, ${stats.cleanupMinutes} min`;
  });
}

function loadGlobalStats() {
  const q = query(collection(db, 'activities'));
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
    globalStatsDiv.textContent = `Compost: ${stats.compostKg} kg, ${stats.compostMinutes} min | Cleanup: ${stats.cleanupKg} kg, ${stats.cleanupMinutes} min`;
  });
}
