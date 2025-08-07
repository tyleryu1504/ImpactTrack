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
    console.log('Dashboard user authenticated:', user.uid, user.email);
    if (userEmailDisplay) {
      userEmailDisplay.textContent = user.email;
    }
    loadUserStats();
    loadGlobalStats();
  }
});

// Fixed logout functionality
logoutButton.addEventListener('click', async (e) => {
  e.preventDefault();
  console.log('Dashboard logout button clicked');
  try {
    await signOut(auth);
    console.log('User signed out successfully');
    // The onAuthStateChanged listener will handle the redirect
  } catch (error) {
    console.error('Logout error:', error);
    alert(`Logout failed: ${error.message}`);
  }
});

function loadUserStats() {
  if (!currentUser) {
    console.log('No current user for stats');
    return;
  }
  
  console.log('Loading user stats for:', currentUser.uid);
  
  const q = query(collection(db, 'users', currentUser.uid, 'logs'));
  onSnapshot(q, (snapshot) => {
    console.log('User stats snapshot received, size:', snapshot.size);
    const stats = { compostKg: 0, cleanupKg: 0, compostMinutes: 0, cleanupMinutes: 0 };
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('User stat data:', data);
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
    
    console.log('Calculated user stats:', stats);
    userStatsDiv.innerHTML = `
      <h3>Your Stats</h3>
      <p>Compost: ${stats.compostKg} kg, ${stats.compostMinutes} min</p>
      <p>Cleanup: ${stats.cleanupKg} kg, ${stats.cleanupMinutes} min</p>
      <p><small>Total entries: ${snapshot.size}</small></p>
    `;
  }, (error) => {
    console.error('Error loading user stats:', error);
    userStatsDiv.innerHTML = `<p>Error loading your stats: ${error.message}</p>`;
  });
}

function loadGlobalStats() {
  console.log('Loading global stats');
  
  const q = query(collectionGroup(db, 'logs'));
  onSnapshot(q, (snapshot) => {
    console.log('Global stats snapshot received, size:', snapshot.size);
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
    
    console.log('Calculated global stats:', stats);
    globalStatsDiv.innerHTML = `
      <h3>Global Stats</h3>
      <p>Total Compost: ${stats.compostKg} kg, ${stats.compostMinutes} min</p>
      <p>Total Cleanup: ${stats.cleanupKg} kg, ${stats.cleanupMinutes} min</p>
      <p><small>Total entries across all users: ${snapshot.size}</small></p>
    `;
  }, (error) => {
    console.error('Error loading global stats:', error);
    globalStatsDiv.innerHTML = `<p>Error loading global stats: ${error.message}</p>`;
  });
}
