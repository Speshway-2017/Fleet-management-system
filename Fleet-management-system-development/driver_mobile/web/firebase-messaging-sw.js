importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBkF48hpNU1TFaN3hKjSluy1-s0cc2fcGQ",
  authDomain: "fleet-management-system-37a81.firebaseapp.com",
  projectId: "fleet-management-system-37a81",
  storageBucket: "fleet-management-system-37a81.firebasestorage.app",
  messagingSenderId: "475613162648",
  appId: "1:475613162648:web:f29fc5a6446152ec7374ed",
  measurementId: "G-KS4TH9FC5C"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
