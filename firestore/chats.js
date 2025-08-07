import { auth, db } from '../firebase-init.js';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { isBlockedBetween } from './users.js';

export async function sendMessage(chatId, content) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const chatRef = doc(db, 'chats', chatId);
  const chatSnap = await getDoc(chatRef);
  if (!chatSnap.exists()) throw new Error('Chat not found');
  const data = chatSnap.data();
  for (const uid of data.participants) {
    if (uid !== user.uid && await isBlockedBetween(user.uid, uid)) {
      throw new Error('Messaging blocked user');
    }
  }
  await addDoc(collection(chatRef, 'messages'), {
    senderId: user.uid,
    formattedText: content,
    timestamp: serverTimestamp()
  });
}

export function listenToMessages(chatId, callback) {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp'));
  return onSnapshot(q, snap => {
    const msgs = [];
    snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
    callback(msgs);
  });
}
