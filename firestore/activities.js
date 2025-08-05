import { addDoc, collection, updateDoc, increment, query, orderBy, getDocs, where, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

/**
 * Logs a new activity for the current user.
 * @param {string} type
 * @param {number} amount
 * @param {string} unit
 * @param {string} note
 */
export async function logActivity(type, amount, unit, note) {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  await addDoc(collection(db, 'activities'), {
    userId: user.uid,
    username: user.displayName,
    type,
    amount,
    unit,
    note,
    createdAt: serverTimestamp(),
    likesCount: 0,
  });
}

/**
 * Likes an activity if not already liked by the current user.
 * @param {string} activityId
 */
export async function likeActivity(activityId) {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const likesRef = collection(db, 'activities', activityId, 'likes');
  const likeQuery = query(likesRef, where('userId', '==', user.uid));
  const existingLike = await getDocs(likeQuery);

  if (existingLike.empty) {
    await addDoc(likesRef, {
      userId: user.uid,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'activities', activityId), {
      likesCount: increment(1),
    });
  }
}

/**
 * Removes the current user's like from an activity.
 * @param {string} activityId
 */
export async function unlikeActivity(activityId) {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const likesRef = collection(db, 'activities', activityId, 'likes');
  const likeQuery = query(likesRef, where('userId', '==', user.uid));
  const existingLike = await getDocs(likeQuery);

  for (const likeDoc of existingLike.docs) {
    await deleteDoc(likeDoc.ref);
    await updateDoc(doc(db, 'activities', activityId), {
      likesCount: increment(-1),
    });
  }
}

/**
 * Retrieves the activity feed ordered by creation date desc.
 * @returns {Promise<Array>} Array of activity objects with id and data.
 */
export async function getActivityFeed() {
  const activitiesRef = collection(db, 'activities');
  const activityQuery = query(activitiesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(activityQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}
