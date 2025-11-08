import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import getFirestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcWRxjAp5nEmd_PCkQrSwdKIywS1hxlpw",
  authDomain: "medicareapp-f0dc0.firebaseapp.com",
  projectId: "medicareapp-f0dc0",
  storageBucket: "medicareapp-f0dc0.firebasestorage.app",
  messagingSenderId: "631948568273",
  appId: "1:631948568273:web:7be567104ec9f4593507f0",
  measurementId: "G-XZVM0ZY349"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app); // Export the Firestore instance

// You can also export other initialized services if needed, e.g.:
// export const analytics = getAnalytics(app);
