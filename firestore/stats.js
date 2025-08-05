import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

// Reference to the global stats document
const globalStatsRef = doc(db, 'stats', 'global');

/**
 * Fetches the global statistics document from Firestore.
 * @returns {Promise<Object|null>} The global stats data or null if missing.
 */
export async function getGlobalStats() {
  const snap = await getDoc(globalStatsRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Increment compost or cleanup statistics.
 * @param {('compost'|'cleanup')} type - Stat type to increment.
 * @param {number} amount - Amount to increment by.
 * @returns {Promise<void>}
 */
export async function incrementStats(type, amount) {
  if (type === 'compost') {
    await updateDoc(globalStatsRef, { totalCompostKg: increment(amount) });
  } else if (type === 'cleanup') {
    await updateDoc(globalStatsRef, { totalCleanupMins: increment(amount) });
  } else {
    throw new Error('Invalid stats type');
  }
}
