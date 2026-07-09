import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const form = document.getElementById("urlShareForm");
const nameInput = document.getElementById("urlShareName");
const ideaInput = document.getElementById("urlShareIdea");
const urlInput = document.getElementById("urlShareUrl");
const statusEl = document.getElementById("urlShareStatus");
const listEl = document.getElementById("urlShareList");
const emptyEl = document.getElementById("urlShareEmpty");

const isConfigured = !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_");

function setStatus(message, type) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = "url-form-status" + (type ? ` ${type}` : "");
}

function normalizeUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function formatTime(date) {
  if (!date) return "";
  return date.toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderList(docs) {
  if (!listEl) return;
  listEl.querySelectorAll(".url-card").forEach((el) => el.remove());
  if (emptyEl) emptyEl.hidden = docs.length > 0;

  docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.url) return;

    const li = document.createElement("li");
    li.className = "url-card";

    const a = document.createElement("a");
    a.className = "url-card-link";
    a.href = data.url;
    a.target = "_blank";
    a.rel = "noopener";

    const nameSpan = document.createElement("span");
    nameSpan.className = "url-card-name";
    nameSpan.textContent = data.name || "익명";

    const ideaSpan = document.createElement("span");
    ideaSpan.className = "url-card-idea";
    ideaSpan.textContent = data.ideaName || "";

    const urlSpan = document.createElement("span");
    urlSpan.className = "url-card-url";
    urlSpan.textContent = data.url.replace(/^https?:\/\//i, "");

    const timeSpan = document.createElement("span");
    timeSpan.className = "url-card-time";
    timeSpan.textContent = formatTime(data.createdAt?.toDate ? data.createdAt.toDate() : null);

    a.append(nameSpan, ideaSpan, urlSpan, timeSpan);
    li.appendChild(a);
    listEl.appendChild(li);
  });
}

if (!isConfigured) {
  setStatus("⚠️ Firebase 설정이 아직 연결되지 않았습니다. assets/firebase-config.js를 채워주세요.", "error");
  if (form) {
    Array.from(form.elements).forEach((el) => {
      el.disabled = true;
    });
  }
} else {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const submissionsRef = collection(db, "deployUrls");
    const listQuery = query(submissionsRef, orderBy("createdAt", "desc"), limit(50));

    onSnapshot(
      listQuery,
      (snapshot) => renderList(snapshot.docs),
      (err) => setStatus(`목록을 불러오지 못했습니다: ${err.message}`, "error")
    );

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const ideaName = ideaInput.value.trim();
      const url = normalizeUrl(urlInput.value);
      if (!name || !ideaName || !url) {
        setStatus("닉네임, 아이디어명, URL을 모두 입력해주세요.", "error");
        return;
      }

      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      setStatus("제출 중...", "");
      try {
        await addDoc(submissionsRef, { name, ideaName, url, createdAt: serverTimestamp() });
        form.reset();
        setStatus("제출되었습니다!", "success");
      } catch (err) {
        setStatus(`제출 실패: ${err.message}`, "error");
      } finally {
        submitBtn.disabled = false;
      }
    });
  } catch (err) {
    setStatus(`Firebase 초기화 실패: ${err.message}`, "error");
  }
}
