import { auth, db } from './firebase-init.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { searchUsers } from './firestore/users.js';

let currentUser = null;

// Check authentication
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  currentUser = user;
  
  // Get user data from Firestore
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    currentUser.username = userDoc.data().username;
  }
  
  loadGlobalStats();
  loadActivityFeed();
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
  signOut(auth);
});

// Activity form submission
const activityForm = document.getElementById('activityForm');
activityForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const type = document.getElementById('activityType').value;
  const amount = parseFloat(document.getElementById('activityAmount').value);
  const unit = document.getElementById('activityUnit').value;
  const note = document.getElementById('activityNote').value || '';
  
  if (!currentUser) return;
  
  try {
    // Add activity to Firestore
    await addDoc(collection(db, 'activities'), {
      userId: currentUser.uid,
      username: currentUser.username || currentUser.email,
      type,
      amount,
      unit,
      note,
      createdAt: serverTimestamp(),
      likesCount: 0
    });
    
    // Update global stats
    await updateGlobalStats(type, amount);
    
    // Reset form and reload data
    activityForm.reset();
    loadGlobalStats();
    loadActivityFeed();
    
    alert('Activity logged successfully!');
  } catch (error) {
    console.error('Error logging activity:', error);
    alert('Error logging activity. Please try again.');
  }
});

// Load global statistics
async function loadGlobalStats() {
  try {
    const statsDoc = await getDoc(doc(db, 'stats', 'global'));
    const globalStatsDiv = document.getElementById('globalStats');
    
    if (statsDoc.exists()) {
      const data = statsDoc.data();
      globalStatsDiv.innerHTML = `
        <div class="stats-grid">
          <div class="stat-item">
            <h3>${data.totalCompostKg || 0} kg</h3>
            <p>Total Compost</p>
          </div>
          <div class="stat-item">
            <h3>${data.totalCleanupMins || 0} mins</h3>
            <p>Total Cleanup</p>
          </div>
        </div>
      `;
    } else {
      globalStatsDiv.innerHTML = `
        <div class="stats-grid">
          <div class="stat-item">
            <h3>0 kg</h3>
            <p>Total Compost</p>
          </div>
          <div class="stat-item">
            <h3>0 mins</h3>
            <p>Total Cleanup</p>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading global stats:', error);
  }
}

// Update global statistics
async function updateGlobalStats(type, amount) {
  try {
    const statsRef = doc(db, 'stats', 'global');
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      // Create initial stats document
      await setDoc(statsRef, {
        totalCompostKg: type === 'compost' ? amount : 0,
        totalCleanupMins: type === 'cleanup' ? amount : 0
      });
    } else {
      // Update existing stats
      if (type === 'compost') {
        await updateDoc(statsRef, {
          totalCompostKg: increment(amount)
        });
      } else if (type === 'cleanup') {
        await updateDoc(statsRef, {
          totalCleanupMins: increment(amount)
        });
      }
    }
  } catch (error) {
    console.error('Error updating global stats:', error);
  }
}

// Load activity feed
async function loadActivityFeed() {
  try {
    const activitiesQuery = query(
      collection(db, 'activities'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(activitiesQuery);
    
    const activityFeedDiv = document.getElementById('activityFeed');
    
    if (snapshot.empty) {
      activityFeedDiv.innerHTML = '<p>No activities yet. Be the first to log an activity!</p>';
      return;
    }
    
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    activityFeedDiv.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <h4>${activity.username}</h4>
        <p>Logged ${activity.amount} ${activity.unit} of ${activity.type}</p>
        ${activity.note ? `<p class="note">"${activity.note}"</p>` : ''}
        <small>${formatDate(activity.createdAt)}</small>
        <button class="likeBtn" onclick="likeActivity('${activity.id}')">
          ❤️ ${activity.likesCount || 0}
        </button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading activity feed:', error);
  }
}

// Like activity function
window.likeActivity = async function(activityId) {
  if (!currentUser) return;
  
  try {
    const activityRef = doc(db, 'activities', activityId);
    await updateDoc(activityRef, {
      likesCount: increment(1)
    });
    
    // Reload the feed to show updated likes
    loadActivityFeed();
  } catch (error) {
    console.error('Error liking activity:', error);
  }
};

// Format date helper
function formatDate(timestamp) {
  if (!timestamp) return 'Just now';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Search users functionality
document.getElementById('searchBar').addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    try {
      const results = await searchUsers(e.target.value);
      if (results.length > 0) {
        window.location.href = `profile.html?uid=${results[0].uid}`;
      } else {
        alert('No users found.');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Error searching users.');
    }
  }
});
