importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

//the Firebase config object
// Must match the Firebase project the app initialises (see REACT_APP_* in .env),
// otherwise background push is registered against a different project.
const firebaseConfig = {
  apiKey: "AIzaSyBI6pmdUHM2FsLY8_NAj5k6lt0LOMu7Zm0",
  authDomain: "shampay-pro.firebaseapp.com",
  projectId: "shampay-pro",
  storageBucket: "shampay-pro.appspot.com",
  messagingSenderId: "668179923805",
  appId: "1:668179923805:web:f7fcd4d0a15466482edeb4",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
