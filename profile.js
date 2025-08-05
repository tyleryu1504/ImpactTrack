import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getUser, searchUsers, blockUser } from './firestore/users.js';
import { getFollowers, getFollowing, followUser, unfollowUser } from './firestore/follows.js';

const params = new URLSearchParams(window.location.search);
const uid = params.get('uid');

onAuthStateChanged(auth, async (user) => {
  if (!user) window.location.href = 'login.html';
  loadProfile(uid || user.uid, user.uid);
});

document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

// Load profile data
async function loadProfile(targetUid, currentUid) {
  const user = await getUser(targetUid);
  const profileView = document.getElementById('profileView');

  profileView.innerHTML = `
    <h2>${user.username}</h2>
    <p>${user.bio || ''}</p>
    <p>Email: ${user.email}</p>
    <button id="followBtn">${await isFollowing(currentUid, targetUid) ? 'Unfollow' : 'Follow'}</button>
    <button id="blockBtn">Block</button>
  `;

  document.getElementById('followBtn').addEventListener('click', async () => {
    if (await isFollowing(currentUid, targetUid)) {
      await unfollowUser(targetUid);
    } else {
      await followUser(targetUid);
    }
    loadProfile(targetUid, currentUid);
  });

  document.getElementById('blockBtn').addEventListener('click', () => blockUser(targetUid));

  // Followers
  const followers = await getFollowers(targetUid);
  document.getElementById('followers').innerHTML = `<h3>Followers: ${followers.length}</h3>`;

  // Following
  const following = await getFollowing(targetUid);
  document.getElementById('following').innerHTML = `<h3>Following: ${following.length}</h3>`;
}

async function isFollowing(currentUid, targetUid) {
  const followers = await getFollowers(targetUid);
  return followers.some(f => f.followerUid === currentUid);
}

// Search users
document.getElementById('searchBar').addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    const results = await searchUsers(e.target.value);
    if (results.length) window.location.href = `profile.html?uid=${results[0].id}`;
    else alert('No users found.');
  }
});
