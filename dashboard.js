import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { collection, query, where, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const userStatsDiv = document.getElementById('user-stats');
const globalStatsDiv = document.getElementById('global-stats');
const logoutButton = document.getElementById('logout');
let currentUser;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    currentUser = user;
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
      if (data.type === 'compost') {
        stats.compostKg += data.kg || 0;
        stats.compostMinutes += data.minutes || 0;
      } else if (data.type === 'cleanup') {
        stats.cleanupKg += data.kg || 0;
        stats.cleanupMinutes += data.minutes || 0;
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
      if (data.type === 'compost') {
        stats.compostKg += data.kg || 0;
        stats.compostMinutes += data.minutes || 0;
      } else if (data.type === 'cleanup') {
        stats.cleanupKg += data.kg || 0;
        stats.cleanupMinutes += data.minutes || 0;
      }
    });
    globalStatsDiv.textContent = `Compost: ${stats.compostKg} kg, ${stats.compostMinutes} min | Cleanup: ${stats.cleanupKg} kg, ${stats.cleanupMinutes} min`;
  });
}
