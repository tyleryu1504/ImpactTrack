import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getUser, searchUsers, blockUser } from './firestore/users.js';
import { getFollowers, getFollowing, followUser, unfollowUser } from './firestore/follows.js';

const params = new URLSearchParams(window.location.search);
const uid = params.get('uid');

onAuthStateChanged(auth, async (user) => {
  if (!user) window.location.href = 'index.html';
  else loadProfile(uid || user.uid, user.uid);
});

document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

// Load profile data
async function loadProfile(targetUid, currentUid) {
  try {
    const user = await getUser(targetUid);
    if (!user) {
      document.getElementById('profileView').innerHTML = '<p>User not found.</p>';
      return;
    }
    
    const profileView = document.getElementById('profileView');
    const isOwnProfile = targetUid === currentUid;
    
    profileView.innerHTML = `
      <h2>${user.username}</h2>
      <p>${user.bio || 'No bio available'}</p>
      <p>Email: ${user.email}</p>
      ${!isOwnProfile ? `
        <button id="followBtn">${await isFollowing(currentUid, targetUid) ? 'Unfollow' : 'Follow'}</button>
        <button id="blockBtn">Block</button>
      ` : ''}
    `;

    if (!isOwnProfile) {
      document.getElementById('followBtn').addEventListener('click', async () => {
        try {
          if (await isFollowing(currentUid, targetUid)) {
            await unfollowUser(targetUid);
          } else {
            await followUser(targetUid);
          }
          loadProfile(targetUid, currentUid);
        } catch (error) {
          console.error('Error following/unfollowing user:', error);
          alert('Error updating follow status.');
        }
      });

      document.getElementById('blockBtn').addEventListener('click', async () => {
        try {
          await blockUser(targetUid);
          alert('User blocked successfully.');
        } catch (error) {
          console.error('Error blocking user:', error);
          alert('Error blocking user.');
        }
      });
    }

    // Followers
    const followers = await getFollowers(targetUid);
    document.getElementById('followers').innerHTML = `<h3>Followers: ${followers.length}</h3>`;

    // Following
    const following = await getFollowing(targetUid);
    document.getElementById('following').innerHTML = `<h3>Following: ${following.length}</h3>`;
  } catch (error) {
    console.error('Error loading profile:', error);
    document.getElementById('profileView').innerHTML = '<p>Error loading profile.</p>';
  }
}

async function isFollowing(currentUid, targetUid) {
  try {
    const followers = await getFollowers(targetUid);
    return followers.some(f => f.followerUid === currentUid);
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

// Search users
document.getElementById('searchBar').addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    try {
      const results = await searchUsers(e.target.value);
      if (results.length) window.location.href = `profile.html?uid=${results[0].uid}`;
      else alert('No users found.');
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Error searching users.');
    }
  }
});
