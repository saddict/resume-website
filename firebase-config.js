import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVee3l5kLSpYE3VbLrUUdjPBYMjRv8HCw",
  authDomain: "resume-website-445c0.firebaseapp.com",
  projectId: "resume-website-445c0",
  storageBucket: "resume-website-445c0.firebasestorage.app",
  messagingSenderId: "71348771967",
  appId: "1:71348771967:web:b50ef133fcf9fd5102734a",
  measurementId: "G-Z72Q548547"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const functions = getFunctions(app);
