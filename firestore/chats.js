import { getAuth } from 'firebase/auth';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const auth = getAuth();

export async function createChat(participants, isGroup = false, groupName = '') {
  const chatData = {
    participants,
    isGroup,
    groupName: isGroup ? groupName : '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: '',
    lastMessageSender: '',
  };

  const chatRef = await addDoc(collection(db, 'chats'), chatData);
  return chatRef.id;
}

export async function sendMessage(chatId, formattedText) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const text = formattedText.replace(/<[^>]*>/g, '');

  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId: user.uid,
    senderName: user.displayName || '',
    text,
    formattedText,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text,
    lastMessageSender: user.displayName || '',
    updatedAt: serverTimestamp(),
  });
}

export function listenToChats(callback) {
  const user = auth.currentUser;
  if (!user) return () => {};

  const chatsQuery = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', user.uid),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(chatsQuery, snapshot => {
    const chats = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    callback(chats);
  });
}

export function listenToMessages(chatId, callback) {
  const messagesQuery = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(messagesQuery, snapshot => {
    const messages = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    callback(messages);
  });
}
