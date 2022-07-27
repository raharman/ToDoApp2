// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8o_q9oodiiAqYsTo-PBL5Ox0xoeTe_hc",
  authDomain: "aplikacia-todo.firebaseapp.com",
  projectId: "aplikacia-todo",
  storageBucket: "aplikacia-todo.appspot.com",
  messagingSenderId: "75507959761",
  appId: "1:75507959761:web:14401ffb76d3b21c3982f0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
