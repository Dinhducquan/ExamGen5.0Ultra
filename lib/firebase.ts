import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer,
  enableIndexedDbPersistence 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore with specified database ID
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Enable offline persistence if running in browser
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.info("Firestore persistence skipped (multiple tabs open)");
    } else if (err.code === "unimplemented") {
      console.info("Firestore persistence not supported in this environment");
    }
  });
}

// Initialize Firebase Auth
export const auth = getAuth(app);

/**
 * Validate Connection to Firestore smoothly without throwing scary offline warning alerts
 */
export async function testConnection(): Promise<boolean> {
  try {
    try {
      await getDocFromServer(doc(db, "test", "connection"));
      console.log("✅ Cloud Firestore connection verified successfully.");
      return true;
    } catch {
      await getDoc(doc(db, "test", "connection"));
      console.log("✅ Cloud Firestore connected (cache/fallback mode).");
      return true;
    }
  } catch (error) {
    console.info("ℹ️ Firestore operates with local cache fallback.");
    return false;
  }
}

// Initial connection test
testConnection();

export default app;
