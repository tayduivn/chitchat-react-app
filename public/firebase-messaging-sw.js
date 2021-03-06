// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/4.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.2.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
firebase.initializeApp({
    messagingSenderId: "606252486542"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
        body: 'Background Message body.',
        icon: '/firebase-logo.png'
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('push', function (event) {
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    // const title = 'Push Codelab';
    // const options = {
    //     body: 'Yay it works.',
    //     icon: 'images/icon.png',
    //     badge: 'images/badge.png'
    // };

    let { notification } = JSON.parse(event.data.text());

    const title = notification.title;
    const options = {
        body: notification.body,
        icon: "./favicon.ico"
    };

    event.waitUntil(self.registration.showNotification(title, options));
});