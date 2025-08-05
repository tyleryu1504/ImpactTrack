import { db, auth } from '../firebase';
import {
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

export async function createUser(uid, data) {
  const userRef = doc(db, 'users', uid);
  const payload = {
    username: data.username,
    username_lowercase: data.username.toLowerCase(),
    email: data.email,
    bio: data.bio || '',
    photoURL: data.photoURL || '',
    followersCount: 0,
    followingCount: 0,
    createdAt: serverTimestamp()
  };
  await setDoc(userRef, payload);
}

export async function blockUser(blockedUid) {
  const blocksCol = collection(db, 'users', auth.currentUser.uid, 'blocks');
  await addDoc(blocksCol, {
    blockedUid,
    createdAt: serverTimestamp()
  });
}

export async function unblockUser(blockedUid) {
  const blocksCol = collection(db, 'users', auth.currentUser.uid, 'blocks');
  const q = query(blocksCol, where('blockedUid', '==', blockedUid));
  const snapshot = await getDocs(q);
  const removals = snapshot.docs.map(d => deleteDoc(d.ref));
  await Promise.all(removals);
}

export async function searchUsers(term) {
  const lower = term.toLowerCase();
  const usersCol = collection(db, 'users');
  const q = query(
    usersCol,
    where('username_lowercase', '>=', lower),
    where('username_lowercase', '<=', lower + '\uf8ff')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({ uid: docSnap.id, ...docSnap.data() }));
}

export async function getUser(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
}

