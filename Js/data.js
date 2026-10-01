import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/* ========== PRODUCTS ========== */
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

/* ========== BANNERS ========== */
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

/* ========== ORDERS ========== */
export async function addOrder(data) {
  return addDoc(collection(db, "orders"), data);
}
export function listenOrders(cb) {
  return onSnapshot(collection(db, "orders"), snap => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    cb(orders);
  });
}
export async function updateOrder(id, data) {
  return updateDoc(doc(db, "orders", id), data);
}
export async function deleteOrder(id) {
  return deleteDoc(doc(db, "orders", id));
}
export async function generateOrderId() {
  const snap = await getDocs(collection(db, "orders"));
  return `CF-${1001 + snap.size}`;
}

/* ========== SETTINGS ========== */
export async function getSettings() {
  const snap = await getDoc(doc(db, "settings", "main"));
  return snap.exists() ? snap.data() : {
    siteName: "CRAZY FLIP",
    logo: "",
    momoNumber: "",
    accountName: "",
    paymentText: "Send Money to the number below, then enter your details.",
    whatsapp: "",
    telegram: ""
  };
}
export async function saveSettings(data) {
  return setDoc(doc(db, "settings", "main"), data, { merge: true });
}
