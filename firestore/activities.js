import { auth, db } from '../firebase-init.js';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { updateGlobalStats } from './stats.js';

export async function logActivity(type, amount, unit, note = '') {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const userSnap = await getDoc(doc(db, 'users', user.uid));
  const username = userSnap.exists() ? userSnap.data().username : '';
  const ref = await addDoc(collection(db, 'activities'), {
    userId: user.uid,
    username,
    type,
    amount: Number(amount),
    unit,
    note,
    createdAt: serverTimestamp(),
    likes: []
  });
  await updateGlobalStats(type, Number(amount));
  return ref;
}

export function getUserActivities(userId, callback) {
  const q = query(
    collection(db, 'activities'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => {
    const arr = [];
    snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
    callback(arr);
  });
}

export async function toggleLike(activityId, userId, hasLiked) {
  const ref = doc(db, 'activities', activityId);
  await updateDoc(ref, {
    likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId)
  });
}
