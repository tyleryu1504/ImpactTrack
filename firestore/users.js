import { auth, db } from '../firebase-init.js';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  getDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

export async function followUser(uid) {
  const current = auth.currentUser;
  if (!current || current.uid === uid) return;
  await setDoc(doc(db, `users/${current.uid}/following`, uid), { createdAt: serverTimestamp() });
  await setDoc(doc(db, `users/${uid}/followers`, current.uid), { createdAt: serverTimestamp() });
}

export async function blockUser(uid) {
  const current = auth.currentUser;
  if (!current || current.uid === uid) return;
  await setDoc(doc(db, `users/${current.uid}/blocks`, uid), { createdAt: serverTimestamp() });
}

export async function searchUsers(term) {
  const q = query(
    collection(db, 'users'),
    where('username_lowercase', '>=', term),
    where('username_lowercase', '<=', term + '\uf8ff')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function isUsernameAvailable(username) {
  const q = query(
    collection(db, 'users'),
    where('username_lowercase', '==', username.toLowerCase())
  );
  const snap = await getDocs(q);
  return snap.empty;
}

export async function isBlockedBetween(a, b) {
  const ab = await getDoc(doc(db, `users/${a}/blocks`, b));
  const ba = await getDoc(doc(db, `users/${b}/blocks`, a));
  return ab.exists() || ba.exists();
}
