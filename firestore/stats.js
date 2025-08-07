import { db } from '../firebase-init.js';
import {
  doc,
  updateDoc,
  increment,
  onSnapshot,
  setDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const statsRef = doc(db, 'stats', 'global');

// Ensure stats document exists
setDoc(statsRef, { totalCompostKg: 0, totalCleanupMinutes: 0, totalUsers: 0 }, { merge: true });

export async function updateGlobalStats(type, amount) {
  const data = {};
  if (type === 'compost') data.totalCompostKg = increment(amount);
  if (type === 'cleanup') data.totalCleanupMinutes = increment(amount);
  await updateDoc(statsRef, data);
}

export async function incrementUserCount() {
  await updateDoc(statsRef, { totalUsers: increment(1) });
}

export function listenToGlobalStats(callback) {
  return onSnapshot(statsRef, doc => callback(doc.data()));
}
