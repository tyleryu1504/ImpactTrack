import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { listenToChats, listenToMessages, sendMessage } from './firestore/chats.js';
import { searchUsers } from './firestore/users.js';

let currentChatId = null;

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = 'login.html';
});

document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

listenToChats((chats) => {
  const chatList = document.getElementById('chatList');
  chatList.innerHTML = '';
  chats.forEach(chat => {
    const div = document.createElement('div');
    div.innerHTML = `<b>${chat.groupName || chat.lastMessageSender}</b><p>${chat.lastMessage}</p>`;
    div.addEventListener('click', () => openChat(chat.id));
    chatList.appendChild(div);
  });
});

function openChat(chatId) {
  currentChatId = chatId;
  listenToMessages(chatId, (messages) => {
    const msgContainer = document.getElementById('messages');
    msgContainer.innerHTML = '';
    messages.forEach(msg => {
      const div = document.createElement('div');
      div.innerHTML = `<p><b>${msg.senderName}:</b> ${msg.formattedText}</p>`;
      msgContainer.appendChild(div);
    });
  });
}

document.getElementById('sendBtn').addEventListener('click', async () => {
  const content = document.getElementById('editor').innerHTML.trim();
  if (content && currentChatId) {
    await sendMessage(currentChatId, content);
    document.getElementById('editor').innerHTML = '';
  }
});

// Search users
document.getElementById('searchBar').addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    const results = await searchUsers(e.target.value);
    if (results.length) window.location.href = `profile.html?uid=${results[0].id}`;
    else alert('No users found.');
  }
});
