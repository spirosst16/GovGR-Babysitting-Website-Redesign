import { initializeApp } from "firebase/app";
import { browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDQtVVeHkRsrtZ3LgYOpqM4Ht6FztA0Zt8",
    authDomain: "babysitter-website.firebaseapp.com",
    projectId: "babysitter-website",
    storageBucket: "babysitter-website.firebasestorage.app",
    messagingSenderId: "324643521469",
    appId: "1:324643521469:web:dd5ea971fe8e616a1108d4",
    measurementId: "G-H9P33S7WQT",
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
    persistence: browserLocalPersistence,
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
