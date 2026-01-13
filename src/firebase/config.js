import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9e_R6aMtuGo9y32tdyvKzPwwKZx-Ea_A",
  authDomain: "rifas-9b7d5.firebaseapp.com",
  projectId: "rifas-9b7d5",
  storageBucket: "rifas-9b7d5.appspot.com",
  messagingSenderId: "1032930971428",
  appId: "1:1032930971428:web:1e65495ddcb43906c2adb1",
};

const app = initializeApp(firebaseConfig);

// 🔐 Auth
export const auth = getAuth(app);

// 📦 Firestore
export const db = getFirestore(app);

export default app;
