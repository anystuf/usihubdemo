import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAnalytics, isSupported as isAnalyticsSupported } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

const app = isFirebaseConfigured() ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;
const functions = app ? getFunctions(app) : null;

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
  if (!app) return null;

  if (!analyticsPromise) {
    analyticsPromise = isAnalyticsSupported()
      .then((supported) => (supported ? getAnalytics(app) : null))
      .catch(() => null);
  }

  return analyticsPromise;
}

export async function callFunction(name, payload) {
  if (!functions) {
    throw new Error("Firebase Functions is not configured for the public demo.");
  }

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
