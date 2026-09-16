import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyClVBI_xBtZDtoSDv6gWFEv9eCa4WPUDjw",
  authDomain: "liberum-f13ff.firebaseapp.com",
  projectId: "liberum-f13ff",
  storageBucket: "liberum-f13ff.firebasestorage.app",
  messagingSenderId: "730903093236",
  appId: "1:730903093236:web:5f181959e3661c9d16e3a1",
  measurementId: "G-KECV7R1DTE"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
