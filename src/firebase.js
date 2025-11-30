import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpMRWtQ4gRxCVtvVticuYZE8jlfumpH_o",
  authDomain: "gym-tracker-1646d.firebaseapp.com",
  projectId: "gym-tracker-1646d",
  storageBucket: "gym-tracker-1646d.firebasestorage.app",
  messagingSenderId: "837459651114",
  appId: "1:837459651114:web:a46473c286978820553153",
  measurementId: "G-2ZB8Q9M5L4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
