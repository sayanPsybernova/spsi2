import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics"; // Added for completeness, though not explicitly used for auth

const firebaseConfig = {
  apiKey: "AIzaSyC4F5unhkldw9Gf4wyLcBfExxLe2_ZozF4",
  authDomain: "spsi-firebase-otp.firebaseapp.com",
  projectId: "spsi-firebase-otp",
  storageBucket: "spsi-firebase-otp.firebasestorage.app",
  messagingSenderId: "414330003864",
  appId: "1:414330003864:web:e43267ce2fe728687b0bed",
  measurementId: "G-D8DD19DG5B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// const analytics = getAnalytics(app); // Not strictly needed for auth, commented out
