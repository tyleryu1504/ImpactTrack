import { auth, db } from './firebase-config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const activityForm = document.getElementById('activity-form');
const activityFeed = document.getElementById('activity-feed');
const logoutButton = document.getElementById('logout');
const minutesInput = document.getElementById('minutes');
const kgInput = document.getElementById('kg');
const unitRadios = document.querySelectorAll('input[name="unit"]');
const userEmailDisplay = document.getElementById('user-email');

let currentUser;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    currentUser = user;
    console.log('User authenticated:', user.uid, user.email);
    if (userEmailDisplay) {
      userEmailDisplay.textContent = user.email;
    }
    loadFeed();
  }
});

activityForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('Form submitted');
  
  if (!currentUser) {
    console.error('No current user');
    alert('You must be logged in to log activities');
    return;
  }

  const unit = document.querySelector('input[name="unit"]:checked').value;
  const activityType = document.getElementById('activity-type').value;
  const notesValue = document.getElementById('notes').value;
  
  const data = {
    userId: currentUser.uid,
    type: activityType,
    minutes: unit === 'minutes' ? Number(minutesInput.value) || 0 : 0,
    kg: unit === 'kg' ? Number(kgInput.value) || 0 : 0,
    notes: notesValue,
    createdAt: Timestamp.now() // Changed from serverTimestamp() to Timestamp.now()
  };
  
  console.log('Attempting to save data:', data);
  console.log('Collection path:', `users/${currentUser.uid}/logs`);

  try {
    const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'logs'), data);
    console.log('Document written with ID: ', docRef.id);
    alert('Activity logged successfully!');
    activityForm.reset();
    // Reset form display
    document.querySelector('input[name="unit"][value="minutes"]').checked = true;
    minutesInput.parentElement.style.display = '';
    kgInput.parentElement.style.display = 'none';
  } catch (error) {
    console.error('Error adding document: ', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    alert(`Error logging activity: ${error.message}`);
  }
});

// Fixed logout functionality
logoutButton.addEventListener('click', async (e) => {
  e.preventDefault();
  console.log('Logout button clicked');
  try {
    await signOut(auth);
    console.log('User signed out successfully');
    // The onAuthStateChanged listener will handle the redirect
  } catch (error) {
    console.error('Logout error:', error);
    alert(`Logout failed: ${error.message}`);
  }
});

function loadFeed() {
  if (!currentUser) {
    console.log('No current user for loading feed');
    return;
  }
  
  console.log('Loading feed for user:', currentUser.uid);
  
  const q = query(
    collection(db, 'users', currentUser.uid, 'logs'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  onSnapshot(q, (snapshot) => {
    console.log('Feed snapshot received, size:', snapshot.size);
    activityFeed.innerHTML = '';
    
    if (snapshot.empty) {
      activityFeed.innerHTML = '<li>No activities logged yet.</li>';
      return;
    }
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Activity data:', data);
      const li = document.createElement('li');
      const unitText = data.kg ? `${data.kg} kg` : `${data.minutes} min`;
      const dateText = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : 'Unknown date';
      li.textContent = `${dateText} - ${data.type} - ${unitText} - ${data.notes || 'No notes'}`;
      activityFeed.appendChild(li);
    });
  }, (error) => {
    console.error('Error loading feed:', error);
    activityFeed.innerHTML = '<li>Error loading activities</li>';
  });
}

unitRadios.forEach((radio) => {
  radio.addEventListener('change', (e) => {
    if (!e.target.checked) return;
    if (e.target.value === 'minutes') {
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
