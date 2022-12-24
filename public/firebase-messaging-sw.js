importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js')

const firebaseConfig = {
    apiKey: 'AIzaSyCZ4QPFiT_rsNCDdTJlqEL0P0-d0zzEo_Q',
    authDomain: 'tarsb-kanteen-2022.firebaseapp.com',
    projectId: 'tarsb-kanteen-2022',
    storageBucket: 'tarsb-kanteen-2022.appspot.com',
    messagingSenderId: '1003054218699',
    appId: '1:1003054218699:web:050c22fd2ec953898aca4e',
    measurementId: 'G-NPEZ8SK1Y4'
  }

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()