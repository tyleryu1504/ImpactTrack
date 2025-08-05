import { logActivity, getActivityFeed } from './firestore/activities.js';

const form = document.getElementById('activity-form');
const feedList = document.getElementById('feed');

async function renderFeed() {
  const feed = await getActivityFeed();
  feedList.innerHTML = '';
  feed.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.username} logged ${item.amount} ${item.unit} of ${item.type}`;
    feedList.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const activity = {
    type: document.getElementById('type').value,
    amount: parseFloat(document.getElementById('amount').value),
    unit: document.getElementById('unit').value,
    note: document.getElementById('note').value,
  };
  await logActivity(activity);
  form.reset();
  renderFeed();
});

renderFeed();
