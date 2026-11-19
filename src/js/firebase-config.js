/**
 * Configurazione centralizzata Firebase (unica fonte di verità per Auth e Firestore).
 */

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCB7tSAXM8SSFKKKjMeXsDK3sFMpyz2xUk",
  authDomain: "preventivi-federico-coletta.firebaseapp.com",
  projectId: "preventivi-federico-coletta",
  storageBucket: "preventivi-federico-coletta.firebasestorage.app",
  messagingSenderId: "226848240794",
  appId: "1:226848240794:web:32658649186bde08af1b23",
};

export const OWNER_EMAIL = "fedecoletta@gmail.com";

let _db = null;
let _persistenceStarted = false;

export function ensureFirebaseApp() {
  if (typeof globalThis.firebase === "undefined") return null;
  const fb = globalThis.firebase;
  if (!fb.apps || fb.apps.length === 0) {
    fb.initializeApp(FIREBASE_CONFIG);
  }
  return fb;
}

export function getFirebaseAuth() {
  const fb = ensureFirebaseApp();
  if (!fb || typeof fb.auth !== "function") return null;
  return fb.auth();
}

export function getFirestoreDb() {
  if (_db) return _db;
  const fb = ensureFirebaseApp();
  if (!fb || typeof fb.firestore !== "function") return null;

  _db = fb.firestore();

  if (!_persistenceStarted) {
    _persistenceStarted = true;
    try {
      _db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err?.code === "failed-precondition") {
          console.warn("[Firestore] Persistenza attiva in un'altra scheda.");
        } else if (err?.code === "unimplemented") {
          console.warn("[Firestore] IndexedDB non supportato da questo browser.");
        }
      });
    } catch (err) {
      console.warn("[Firestore] enablePersistence non disponibile:", err);
    }
  }

  return _db;
}

export function isDevEnvironment() {
  if (typeof window === "undefined" || !window.location) return false;
  const host = (window.location.hostname || "").toLowerCase();
  const proto = (window.location.protocol || "").toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return true;
  if (host.endsWith(".run.app") && proto === "https:") return true;
  return false;
}
