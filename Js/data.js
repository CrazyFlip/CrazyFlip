import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, setDoc, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ============ PRODUCTS ============
export async function getProducts() {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function addProduct(data) {
  return addDoc(collection(db, "products"), data);
}
export async function updateProduct(id, data) {
  return updateDoc(doc(db, "products", id), data);
}
export async function deleteProduct(id) {
  return deleteDoc(doc(db, "products", id));
}

// ============ BANNERS ============
export async function getBanners() {
  const snap = await getDocs(collection(db, "banners"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function addBanner(data) {
  return addDoc(collection(db, "banners"), data);
}
export async function updateBanner(id, data) {
  return updateDoc(doc(db, "banners", id), data);
}
export async function deleteBanner(id) {
  return deleteDoc(doc(db, "banners", id));
}

// ============ ORDERS ============
export async function addOrder(data) {
  return addDoc(collection(db, "orders"), data);
}
export async function getOrders() {
  const snap = await getDocs(collection(db, "orders"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function updateOrder(id, data) {
  return updateDoc(doc(db, "orders", id), data);
}
export async function deleteOrder(id) {
  return deleteDoc(doc(db, "orders", id));
}
export function listenOrders(cb) {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// Auto Order ID: CF-1001, CF-1002...
export async function generateOrderId() {
  const snap = await getDocs(collection(db, "orders"));
  const next = 1001 + snap.size;
  return `CF-${next}`;
}

// ============ SETTINGS ============
export async function getSettings() {
  const snap = await getDoc(doc(db, "settings", "main"));
  return snap.exists() ? snap.data() : {
    siteName: "CRAZY FLIP",
    logo: "",
    momoNumber: "024XXXXXXX",
    accountName: "CRAZY FLIP",
    paymentText: "Send Money to the number below, then enter your details.",
    whatsapp: "",
    telegram: ""
  };
}
export async function saveSettings(data) {
  return setDoc(doc(db, "settings", "main"), data, { merge: true });
}
