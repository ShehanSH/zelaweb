import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export function getFirebaseConfig() {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || cfg.apiKey.includes("PASTE_")) {
    return null;
  }
  return cfg;
}

export function initFirebase() {
  const cfg = getFirebaseConfig();
  if (!cfg) return null;
  const app = initializeApp(cfg);
  const db = getFirestore(app);
  return { app, db };
}

export async function fetchProducts(db) {
  const q = query(collection(db, "products"), orderBy("displayOrder", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

