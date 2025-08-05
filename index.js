import { auth, db } from './firebase-config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const activityForm = document.getElementById('activity-form');
const activityFeed = document.getElementById('activity-feed');
const logoutButton = document.getElementById('logout');

let currentUser;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    currentUser = user;
    loadFeed();
  }
});

activityForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const data = {
    userId: currentUser.uid,
    type: document.getElementById('activity-type').value,
    minutes: Number(document.getElementById('minutes').value) || 0,
    kg: Number(document.getElementById('kg').value) || 0,
    notes: document.getElementById('notes').value,
    createdAt: serverTimestamp()
  };
  try {
    await addDoc(collection(db, 'activities'), data);
    activityForm.reset();
  } catch (err) {
    alert(err.message);
  }
});

logoutButton.addEventListener('click', () => {
  signOut(auth);
});

function loadFeed() {
  const q = query(
    collection(db, 'activities'),
    where('userId', '==', currentUser.uid),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  onSnapshot(q, (snapshot) => {
    activityFeed.innerHTML = '';
    snapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement('li');
      li.textContent = `${data.type} - ${data.minutes} min - ${data.kg} kg - ${data.notes}`;
      activityFeed.appendChild(li);
    });
  });
}
