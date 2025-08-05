import { auth, db } from '../firebase-init.js';
import { 
  addDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

export const followUser = async (targetUid) => {
  const myUid = auth.currentUser?.uid;
  if (!myUid) throw new Error('No authenticated user');

  const createdAt = serverTimestamp();

  await addDoc(collection(db, 'users', myUid, 'following'), {
    followingUid: targetUid,
    createdAt,
  });

  await addDoc(collection(db, 'users', targetUid, 'followers'), {
    followerUid: myUid,
    createdAt,
  });
};

export const unfollowUser = async (targetUid) => {
  const myUid = auth.currentUser?.uid;
  if (!myUid) throw new Error('No authenticated user');

  const followingQuery = query(
    collection(db, 'users', myUid, 'following'),
    where('followingUid', '==', targetUid)
  );
  const followingSnap = await getDocs(followingQuery);
  await Promise.all(followingSnap.docs.map((doc) => deleteDoc(doc.ref)));

  const followersQuery = query(
    collection(db, 'users', targetUid, 'followers'),
    where('followerUid', '==', myUid)
  );
  const followersSnap = await getDocs(followersQuery);
  await Promise.all(followersSnap.docs.map((doc) => deleteDoc(doc.ref)));
};

export const getFollowers = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'followers'));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getFollowing = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'following'));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
