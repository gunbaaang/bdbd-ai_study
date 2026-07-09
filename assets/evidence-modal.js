(function () {
  const GROUPS = {
    codex: {
      title: "Codex 화면 증적",
      images: [
        "assets/images/codex1.png",
        "assets/images/codex2.png",
        "assets/images/codex3.png",
        "assets/images/codex4.png",
      ],
    },
    claude: {
      title: "Claude 화면 증적",
      images: [
        "assets/images/claude1.png",
        "assets/images/claude2.png",
        "assets/images/claude3.png",
      ],
    },
  };

  const modal = document.getElementById("evidenceModal");
  const titleEl = document.getElementById("evidenceModalTitle");
  const imageEl = document.getElementById("evidenceImage");
  const counterEl = document.getElementById("evidenceCounter");
  const prevBtn = document.getElementById("evidencePrev");
  const nextBtn = document.getElementById("evidenceNext");
  if (!modal) return;

  let currentGroup = null;
  let currentIndex = 0;

  function render() {
    if (!currentGroup) return;
    const images = GROUPS[currentGroup].images;
    imageEl.src = images[currentIndex];
    imageEl.alt = `${GROUPS[currentGroup].title} ${currentIndex + 1}`;
    counterEl.textContent = `${currentIndex + 1} / ${images.length}`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === images.length - 1;
  }

  function open(groupKey) {
    const group = GROUPS[groupKey];
    if (!group) return;
    currentGroup = groupKey;
    currentIndex = 0;
    titleEl.textContent = group.title;
    render();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = "";
    currentGroup = null;
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-evidence-group]");
    if (btn) {
      open(btn.getAttribute("data-evidence-group"));
      return;
    }
    if (e.target.closest("[data-evidence-close]")) {
      close();
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      render();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (!currentGroup) return;
    if (currentIndex < GROUPS[currentGroup].images.length - 1) {
      currentIndex += 1;
      render();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") prevBtn.click();
    else if (e.key === "ArrowRight") nextBtn.click();
  });
})();
