import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDSWhQZk7HD76L8Y1sG6hIpTmiPsnK_uHI",
  authDomain: "contactos-app-isw009-and-3b2b5.firebaseapp.com",
  projectId: "contactos-app-isw009-and-3b2b5",
  storageBucket: "contactos-app-isw009-and-3b2b5.firebasestorage.app",
  messagingSenderId: "181286247722",
  appId: "1:181286247722:web:6accf4f7fe974520525253",
};

// firebase init
const app = initializeApp(firebaseConfig);

// firestore init
const db = getFirestore(app);

export { db };

