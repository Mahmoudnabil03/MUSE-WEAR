import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getFirebaseConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return { projectId, clientEmail, privateKey };
}

function initializeFirebase(): App {
  if (app) return app;
  const { projectId, clientEmail, privateKey } = getFirebaseConfig();
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
  }
  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return app;
}

function getAuthInstance(): Auth {
  if (!authInstance) {
    if (!app) initializeFirebase();
    authInstance = getAuth(app!);
  }
  return authInstance;
}

function getFirestoreInstance(): Firestore {
  if (!dbInstance) {
    if (!app) initializeFirebase();
    dbInstance = getFirestore(app!);
  }
  return dbInstance;
}

// Lazy getters - functions that return the initialized instances
export function getFirebaseAuth(): Auth {
  return getAuthInstance();
}

export function getFirebaseFirestore(): Firestore {
  return getFirestoreInstance();
}

export function getFirebaseApp(): App {
  if (!app) initializeFirebase();
  return app!;
}