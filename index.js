import { auth, db } from './firebase-config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const activityForm = document.getElementById('activity-form');
const activityFeed = document.getElementById('activity-feed');
const logoutButton = document.getElementById('logout');
const minutesInput = document.getElementById('minutes');
const kgInput = document.getElementById('kg');
const unitRadios = document.querySelectorAll('input[name="unit"]');

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
  const unit = document.querySelector('input[name="unit"]:checked').value;
  const data = {
    userId: currentUser.uid,
    type: document.getElementById('activity-type').value,
    minutes: unit === 'minutes' ? Number(minutesInput.value) || 0 : 0,
    kg: unit === 'kg' ? Number(kgInput.value) || 0 : 0,
    notes: document.getElementById('notes').value,
    createdAt: serverTimestamp()
  };
  try {
    await addDoc(collection(db, 'activities'), data);
    activityForm.reset();
    minutesInput.parentElement.style.display = '';
    kgInput.parentElement.style.display = 'none';
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
      const unitText = data.kg ? `${data.kg} kg` : `${data.minutes} min`;
      li.textContent = `${data.type} - ${unitText} - ${data.notes}`;
      activityFeed.appendChild(li);
    });
  });
}

unitRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.value === 'minutes') {
      minutesInput.parentElement.style.display = '';
      kgInput.parentElement.style.display = 'none';
      kgInput.value = '';
    } else {
      kgInput.parentElement.style.display = '';
      minutesInput.parentElement.style.display = 'none';
      minutesInput.value = '';
    }
  });
});
