// login.js

import { initAuth } from './auth-common.js';

// Initialize authentication on the login (index) page.
// After a successful login or signup, the user will be redirected
// to the dashboard.
initAuth({
  onLogin(user) {
    // Redirect to the dashboard after login
    window.location.href = 'dashboard.html';
  },
  onLogout() {
    // Optional: clear any state or display a message
    console.log('User has logged out');
  }
});
