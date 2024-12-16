// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDULRV6j7x7iJjf8_hwm8D9iRrfm42P8eY",
    authDomain: "concertdiscoveryapp.firebaseapp.com",
    projectId: "concertdiscoveryapp",
    storageBucket: "concertdiscoveryapp.firebasestorage.app",
    messagingSenderId: "199222338484",
    appId: "1:199222338484:web:c58c55e6111793173008e1",
    measurementId: "G-4M6146VE1Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const _analytics = getAnalytics(app);

const auth = getAuth(app);

export { auth };