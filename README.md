# ImpactTrack

ImpactTrack is a minimal activity tracker for composting and cleanup efforts. It uses Firebase for authentication and data storage.

## Setup

1. Create a Firebase project and enable Email/Password and Google sign-in providers.
2. Update `firebase-config.js` with your project's configuration details.
3. Host these static files or serve them locally (e.g., with `npx serve`).

## Pages

- `login.html` – Sign in or register using email/password or Google.
- `index.html` – Log composting or cleanup activities and view recent entries.
- `dashboard.html` – View personal and global statistics.

## Firebase Security Rules

See [firestore.rules](firestore.rules) for a basic starting point. Adjust as needed for your project.
