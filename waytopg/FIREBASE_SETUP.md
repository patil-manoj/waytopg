# Firebase Setup

This project uses Firebase Phone Authentication. Follow these steps to set up Firebase:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Phone Authentication:
   - Go to Authentication > Sign-in methods
   - Enable "Phone" as a sign-in method
4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click the web icon `</>` to create a new web app
   - Register the app with a nickname
   - Copy the configuration object
5. Set up your environment variables in `.env`:

```env
VITE_API_URL=https://waytopg-dev.onrender.com/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

6. In the Firebase Console, add your domain to the authorized domains:
   - Go to Authentication > Sign-in methods
   - Under "Authorized domains", add your domain

For development, make sure to add `localhost` to the authorized domains.
