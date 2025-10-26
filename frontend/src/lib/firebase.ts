import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import { getApps, initializeApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { getAuth } from "firebase/auth";

const buildConfig = (): FirebaseOptions | null => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!apiKey || !authDomain || !projectId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;

export const getFirebaseApp = (): FirebaseApp | null => {
  const config = buildConfig();
  if (!config) {
    return null;
  }
  if (appInstance) {
    return appInstance;
  }
  const apps = getApps();
  appInstance = apps.length ? apps[0] : initializeApp(config);
  return appInstance;
};

export const getFirebaseAuth = (): Auth | null => {
  if (typeof window === "undefined") {
    return null;
  }
  if (authInstance) {
    return authInstance;
  }
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }
  authInstance = getAuth(app);
  return authInstance;
};
