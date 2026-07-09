// 클립보드 복사
function copyText(btn, text) {
  const decoded = text;
  const done = () => {
    const original = btn.innerHTML;
    btn.classList.add("copied");
    btn.innerHTML = "복사됨 ✓";
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = original;
    }, 1600);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(decoded).then(done).catch(() => fallbackCopy(decoded, done));
  } else {
    fallbackCopy(decoded, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
    done();
  } catch (e) {
    alert("복사에 실패했습니다. 직접 선택해서 복사해주세요.");
  }
  document.body.removeChild(ta);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-copy-target]");
  if (!btn) return;
  const targetId = btn.getAttribute("data-copy-target");
  const el = document.getElementById(targetId);
  if (!el) return;
  const text = el.tagName === "TEXTAREA" ? el.value : el.innerText;
  copyText(btn, text);
});

// FAQ 아코디언
document.addEventListener("click", (e) => {
  const q = e.target.closest(".faq-question");
  if (!q) return;
  const item = q.closest(".faq-item");
  item.classList.toggle("open");
});

// 프롬프트 직접 수정: 자동저장 + 원본으로 되돌리기
(function () {
  const STORAGE_PREFIX = "promptEdit:";
  const editableEls = Array.from(document.querySelectorAll("[data-editable-prompt]"));
  if (!editableEls.length) return;

  const defaults = new Map();

  const getContent = (el) => (el.tagName === "TEXTAREA" ? el.value : el.textContent);
  const setContent = (el, text) => {
    if (el.tagName === "TEXTAREA") el.value = text;
    else el.textContent = text;
  };

  const autoSize = (el) => {
    if (el.tagName !== "TEXTAREA") return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const updateStatus = (id) => {
    const statusEl = document.querySelector(`[data-status-for="${id}"]`);
    if (!statusEl) return;
    const el = document.getElementById(id);
    statusEl.classList.toggle("visible", getContent(el) !== defaults.get(id));
  };

  editableEls.forEach((el) => {
    const id = el.id;
    if (!id) return;
    defaults.set(id, getContent(el));

    const saved = localStorage.getItem(STORAGE_PREFIX + id);
    if (saved !== null) setContent(el, saved);

    autoSize(el);
    updateStatus(id);

    el.addEventListener("input", () => {
      localStorage.setItem(STORAGE_PREFIX + id, getContent(el));
      autoSize(el);
      updateStatus(id);
    });
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-reset-target]");
    if (!btn) return;
    const id = btn.getAttribute("data-reset-target");
    const el = document.getElementById(id);
    if (!el || !defaults.has(id)) return;
    setContent(el, defaults.get(id));
    localStorage.removeItem(STORAGE_PREFIX + id);
    autoSize(el);
    updateStatus(id);
  });
})();

// 타이틀 화면: 스크롤 유도 버튼 + 느린 커스텀 스크롤 전환 + 페이드 아웃
(function () {
  const titleScreen = document.getElementById("titleScreen");
  const scrollCue = document.getElementById("scrollCue");
  const pageContent = document.getElementById("pageContent");
  if (!titleScreen || !pageContent) return;

  const TRANSITION_DURATION = 1100; // ms, 느리고 부드러운 전환 속도
  let isAnimating = false;

  function animateScrollTo(targetY, duration) {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    if (Math.abs(distance) < 1) return;
    isAnimating = true;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      window.scrollTo(0, startY + distance * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        isAnimating = false;
      }
    }
    requestAnimationFrame(step);
  }

  function inTitleZone() {
    return window.scrollY < window.innerHeight - 2;
  }

  scrollCue?.addEventListener("click", () => {
    animateScrollTo(pageContent.offsetTop, TRANSITION_DURATION);
  });

  window.addEventListener(
    "wheel",
    (e) => {
      if (isAnimating) {
        e.preventDefault();
        return;
      }
      if (!inTitleZone()) return;
      if (e.deltaY > 0) {
        e.preventDefault();
        animateScrollTo(pageContent.offsetTop, TRANSITION_DURATION);
      } else if (e.deltaY < 0 && window.scrollY > 0) {
        e.preventDefault();
        animateScrollTo(0, TRANSITION_DURATION);
      }
    },
    { passive: false }
  );

  let touchStartY = null;
  window.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (touchStartY === null) return;
      if (isAnimating) {
        e.preventDefault();
        return;
      }
      if (!inTitleZone()) return;
      const deltaY = touchStartY - e.touches[0].clientY;
      if (Math.abs(deltaY) > 30) {
        e.preventDefault();
        if (deltaY > 0) {
          animateScrollTo(pageContent.offsetTop, TRANSITION_DURATION);
        } else if (window.scrollY > 0) {
          animateScrollTo(0, TRANSITION_DURATION);
        }
        touchStartY = null;
      }
    },
    { passive: false }
  );

  window.addEventListener(
    "scroll",
    () => {
      const fadeDistance = window.innerHeight * 0.8;
      const opacity = 1 - Math.min(1, window.scrollY / fadeDistance);
      titleScreen.style.opacity = opacity;
    },
    { passive: true }
  );
})();

// 4단계 끝 → 실습 완료 카드로 느린 커스텀 스크롤 전환
(function () {
  const step4 = document.getElementById("step4");
  const celebrate = document.getElementById("celebrateSection");
  if (!step4 || !celebrate) return;

  const TRANSITION_DURATION = 900;
  let isAnimating = false;

  function animateScrollTo(targetY, duration) {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    if (Math.abs(distance) < 1) return;
    isAnimating = true;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, startY + distance * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        isAnimating = false;
      }
    }
    requestAnimationFrame(step);
  }

  function nearStep4End() {
    const step4Bottom = step4.offsetTop + step4.offsetHeight;
    const viewportBottom = window.scrollY + window.innerHeight;
    return window.scrollY < celebrate.offsetTop && viewportBottom >= step4Bottom;
  }

  window.addEventListener(
    "wheel",
    (e) => {
      if (isAnimating) return;
      if (e.deltaY > 0 && nearStep4End()) {
        e.preventDefault();
        animateScrollTo(celebrate.offsetTop, TRANSITION_DURATION);
      }
    },
    { passive: false }
  );

  let touchStartY = null;
  window.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (touchStartY === null || isAnimating) return;
      const deltaY = touchStartY - e.touches[0].clientY;
      if (deltaY > 30 && nearStep4End()) {
        e.preventDefault();
        animateScrollTo(celebrate.offsetTop, TRANSITION_DURATION);
        touchStartY = null;
      }
    },
    { passive: false }
  );
})();
