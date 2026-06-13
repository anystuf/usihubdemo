import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAnalytics, isSupported as isAnalyticsSupported } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzWwRcSGM1kdr-rkwFzpU7TDSqzy6M9FA",
  authDomain: "usi-hub-platform.firebaseapp.com",
  projectId: "usi-hub-platform",
  storageBucket: "usi-hub-platform.firebasestorage.app",
  messagingSenderId: "143262095",
  appId: "1:143262095:web:c7f0a20e757a89a019cbfa",
  measurementId: "G-81W7PV02ZX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

let analyticsPromise;

export function getFirebaseApp() {
  return app;
}

export function getFirebaseServices() {
  return { app, auth, db, storage, functions };
}

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.projectId);
}

export async function initAnalytics() {
  if (!analyticsPromise) {
    analyticsPromise = isAnalyticsSupported()
      .then((supported) => (supported ? getAnalytics(app) : null))
      .catch(() => null);
  }

  return analyticsPromise;
}

export async function callFunction(name, payload) {
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return result.data;
}

export async function requireAuthPlaceholder() {
  return {
    uid: "demo-user",
    role: "prototype-viewer",
    displayName: "Demo User"
  };
}
