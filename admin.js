import { initFirebase } from "./firebase-public.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const fb = initFirebase();
const loginCard = document.getElementById("loginCard");
const editorCard = document.getElementById("editorCard");
const listCard = document.getElementById("listCard");

const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const loginMsg = document.getElementById("loginMsg");
const saveMsg = document.getElementById("saveMsg");

const btnNew = document.getElementById("btnNew");
const btnSave = document.getElementById("btnSave");
const btnDelete = document.getElementById("btnDelete");

const productList = document.getElementById("productList");
const imagePreview = document.getElementById("imagePreview");

const pOrder = document.getElementById("pOrder");
const pName = document.getElementById("pName");
const pDescription = document.getElementById("pDescription");
const pMaterial = document.getElementById("pMaterial");
const pPrice = document.getElementById("pPrice");
const pStock = document.getElementById("pStock");
const pImages = document.getElementById("pImages");

let auth;
let db;
let selectedId = null;
let selectedImageUrls = [];

function setMsg(el, text) {
  if (!el) return;
  el.textContent = text || "";
}

function requireFirebase() {
  if (!fb) {
    setMsg(loginMsg, "Firebase is not configured. Edit firebase-config.js first.");
    btnLogin.disabled = true;
    return false;
  }
  return true;
}

async function loadList() {
  productList.innerHTML = "";
  const q = query(collection(db, "products"), orderBy("displayOrder", "desc"));
  const snap = await getDocs(q);
  snap.forEach(d => {
    const p = d.data();
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <img class="thumb" src="${(p.images && p.images[0]) || ""}" alt="">
      <div style="flex:1;">
        <h4>${p.name || "(no title)"}</h4>
        <div class="row" style="margin-top:0.35rem;">
          <span class="pill ${p.outOfStock ? "out" : "in"}">${p.outOfStock ? "OUT" : "IN"}</span>
          <span class="muted">${p.price || ""}</span>
        </div>
      </div>
      <button class="btn ghost" type="button" data-id="${d.id}">Edit</button>
    `;
    el.querySelector("button").addEventListener("click", () => selectProduct(d.id));
    productList.appendChild(el);
  });
}

function clearEditor() {
  selectedId = null;
  selectedImageUrls = [];
  pOrder.value = "";
  pName.value = "";
  pDescription.value = "";
  pMaterial.value = "";
  pPrice.value = "";
  pStock.value = "in";
  pImages.value = "";
  imagePreview.innerHTML = "";
  btnSave.disabled = false;
  btnDelete.disabled = true;
}

function renderPreviews() {
  imagePreview.innerHTML = "";
  selectedImageUrls.forEach((url, idx) => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.alignItems = "center";
    wrap.style.gap = "0.35rem";
    wrap.innerHTML = `
      <img src="${url}" alt="" style="width:96px;height:96px;border-radius:12px;object-fit:cover;background:#f5f1ed;">
      <button type="button" class="btn ghost" style="padding:0.45rem 0.7rem;font-size:0.85rem;">Remove</button>
    `;
    wrap.querySelector("button").addEventListener("click", async () => {
      selectedImageUrls = selectedImageUrls.filter((_, i) => i !== idx);
      renderPreviews();
    });
    imagePreview.appendChild(wrap);
  });
}

async function selectProduct(id) {
  const refDoc = doc(db, "products", id);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return;
  const p = snap.data();
  selectedId = id;
  selectedImageUrls = Array.isArray(p.images) ? p.images : [];

  pOrder.value = p.displayOrder ?? "";
  pName.value = p.name ?? "";
  pDescription.value = p.description ?? "";
  pMaterial.value = p.material ?? "";
  pPrice.value = p.price ?? "";
  pStock.value = p.outOfStock ? "out" : "in";
  pImages.value = "";
  renderPreviews();

  btnSave.disabled = false;
  btnDelete.disabled = false;
  setMsg(saveMsg, "");
}

async function uploadSelectedFiles(files) {
  const urls = [];
  for (const file of files) {
    const resp = await fetch(`/api/blob-upload?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      body: file,
      headers: { "content-type": file.type || "application/octet-stream" }
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || "Blob upload failed");
    }
    const blob = await resp.json();
    if (!blob?.url) throw new Error("Blob upload failed (no url)");
    urls.push(blob.url);
  }
  return urls;
}

async function saveProduct() {
  btnSave.disabled = true;
  setMsg(saveMsg, "Saving...");
  try {
    const displayOrder = Number(pOrder.value || "0");
    const outOfStock = pStock.value === "out";

    let newUrls = [];
    if (pImages.files && pImages.files.length > 0) {
      newUrls = await uploadSelectedFiles(pImages.files);
    }

    const payload = {
      displayOrder,
      name: pName.value.trim(),
      description: pDescription.value.trim(),
      material: pMaterial.value.trim(),
      price: pPrice.value.trim(),
      outOfStock,
      images: [...selectedImageUrls, ...newUrls],
      updatedAt: serverTimestamp()
    };

    if (!payload.name) throw new Error("Title is required.");
    if (!payload.price) throw new Error("Price is required.");
    if (!payload.material) throw new Error("Material is required.");
    if (!payload.images.length) throw new Error("Upload at least 1 image.");

    if (selectedId) {
      await updateDoc(doc(db, "products", selectedId), payload);
    } else {
      payload.createdAt = serverTimestamp();
      const res = await addDoc(collection(db, "products"), payload);
      selectedId = res.id;
    }

    // refresh
    await loadList();
    await selectProduct(selectedId);
    setMsg(saveMsg, "Saved.");
  } catch (e) {
    setMsg(saveMsg, e.message || "Failed to save.");
  } finally {
    btnSave.disabled = false;
  }
}

async function deleteProduct() {
  if (!selectedId) return;
  btnDelete.disabled = true;
  setMsg(saveMsg, "Deleting...");
  try {
    await deleteDoc(doc(db, "products", selectedId));
    clearEditor();
    await loadList();
    setMsg(saveMsg, "Deleted.");
  } catch (e) {
    setMsg(saveMsg, e.message || "Failed to delete.");
  } finally {
    btnDelete.disabled = false;
  }
}

btnNew.addEventListener("click", () => {
  clearEditor();
  setMsg(saveMsg, "Creating new product...");
});
btnSave.addEventListener("click", saveProduct);
btnDelete.addEventListener("click", deleteProduct);

btnLogin.addEventListener("click", async () => {
  if (!requireFirebase()) return;
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;
  btnLogin.disabled = true;
  setMsg(loginMsg, "Logging in...");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    setMsg(loginMsg, "");
  } catch (e) {
    setMsg(loginMsg, e.message || "Login failed.");
  } finally {
    btnLogin.disabled = false;
  }
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
});

function showAdmin() {
  loginCard.style.display = "none";
  editorCard.style.display = "";
  listCard.style.display = "";
  btnLogout.style.display = "";
}

function showLogin() {
  loginCard.style.display = "";
  editorCard.style.display = "none";
  listCard.style.display = "none";
  btnLogout.style.display = "none";
}

function init() {
  if (!requireFirebase()) return;
  auth = getAuth(fb.app);
  db = getFirestore(fb.app);

  onAuthStateChanged(auth, async user => {
    if (user) {
      showAdmin();
      await loadList();
      clearEditor();
    } else {
      showLogin();
    }
  });
}

init();

