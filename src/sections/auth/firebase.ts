import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_APPID,
  measurementId: process.env.REACT_APP_MEASUREMENT,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestPermission = () => {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      return getToken(messaging, { vapidKey: process.env.REACT_APP_vapidKey })
        .then((currentToken) => {
          if (currentToken) {
            sessionStorage.setItem("fcm", currentToken);
          } else {
          }
        })
        .catch((err) => {
          console.error("An error occurred while retrieving token. ", err);
        });
    } else {
    }
  });
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
