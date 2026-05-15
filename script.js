document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const tab = this.dataset.tab;
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tool-section").forEach((s) => s.classList.remove("active"));
    this.classList.add("active");
    document.getElementById(tab).classList.add("active");
  });
});

(function () {
  const canvas = document.getElementById("starsCanvas");
  const ctx = canvas.getContext("2d");
  let W, H, stars = [], shooters = [], nebulaPoints = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
    buildNebula();
  }

  function buildStars() {
    stars = [];
    const density = (W * H) / 4200;
    for (let i = 0; i < density; i++) {
      const tier = Math.random();
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: tier < 0.65 ? Math.random() * 0.8 + 0.15 : tier < 0.9 ? Math.random() * 1.3 + 0.6 : Math.random() * 2.2 + 1.2,
        baseA: tier < 0.65 ? Math.random() * 0.35 + 0.08 : tier < 0.9 ? Math.random() * 0.5 + 0.2 : Math.random() * 0.65 + 0.35,
        speed: Math.random() * 0.006 + 0.001,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.15 ? (Math.random() < 0.5 ? 200 : 40) : 0,
        spike: tier > 0.9 && Math.random() < 0.4,
      });
    }
  }

  function buildNebula() {
    nebulaPoints = [
      { x: W * 0.12, y: H * 0.18, r: W * 0.28, hue: 270, a: 0.055 },
      { x: W * 0.82, y: H * 0.75, r: W * 0.22, hue: 240, a: 0.045 },
      { x: W * 0.55, y: H * 0.35, r: W * 0.18, hue: 300, a: 0.03 },
      { x: W * 0.3, y: H * 0.8, r: W * 0.2, hue: 260, a: 0.035 },
      { x: W * 0.9, y: H * 0.2, r: W * 0.15, hue: 220, a: 0.025 },
    ];
  }

  function spawnShooter() {
    const angle = Math.PI / 6 + (Math.random() * Math.PI) / 8;
    const speed = 7 + Math.random() * 9;
    shooters.push({
      x: Math.random() * W * 1.2 - W * 0.1,
      y: Math.random() * H * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 80 + Math.random() * 120,
      alpha: 0.9,
      fade: 0.012 + Math.random() * 0.008,
      r: 0.8 + Math.random() * 0.7,
    });
  }

  let t = 0, nextShoot = 180 + Math.random() * 240;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t++;

    nebulaPoints.forEach((n) => {
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, `hsla(${n.hue},75%,42%,${n.a})`);
      g.addColorStop(0.45, `hsla(${n.hue},65%,35%,${n.a * 0.4})`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    stars.forEach((s) => {
      const tw = 0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase);
      const a = s.baseA * (0.55 + 0.45 * tw);

      const col = s.hue === 200
        ? `rgba(160,210,255,${a})`
        : s.hue === 40
        ? `rgba(255,230,150,${a})`
        : `rgba(215,195,255,${a})`;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    });

    if (t >= nextShoot) {
      spawnShooter();
      nextShoot = t + 200 + Math.random() * 300;
    }

    shooters.forEach((sh) => {
      const tailX = sh.x - Math.cos(Math.atan2(sh.vy, sh.vx)) * sh.len;
      const tailY = sh.y - Math.sin(Math.atan2(sh.vy, sh.vx)) * sh.len;

      const g = ctx.createLinearGradient(tailX, tailY, sh.x, sh.y);
      g.addColorStop(0, "transparent");
      g.addColorStop(0.6, `rgba(200,180,255,${sh.alpha * 0.3})`);
      g.addColorStop(1, `rgba(240,230,255,${sh.alpha})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(sh.x, sh.y);
      ctx.strokeStyle = g;
      ctx.lineWidth = sh.r;
      ctx.lineCap = "round";
      ctx.stroke();

      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.alpha -= sh.fade;
    });

    shooters = shooters.filter((sh) => sh.alpha > 0 && sh.x < W + 200 && sh.y < H + 200);
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
})();

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "✓ اتنسخ";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "نسخ";
      btn.classList.remove("copied");
    }, 2000);
  });
}

const iconUp = `🔼`;
const iconDown = `🔽`;
const iconEdit = `✏️`;
const iconDel = `🗑️`;

(function () {
  let state = [];
  let editingId = null;
  let currentType = null;

  const modal = document.getElementById("cv2Modal");
  const modalTitle = document.getElementById("cv2ModalTitle");
  const modalBody = document.getElementById("cv2ModalBody");
  const modalSave = document.getElementById("cv2ModalSave");
  const cv2List = document.getElementById("cv2List");
  const cv2Preview = document.getElementById("cv2Preview");
  const cv2Code = document.getElementById("cv2Code");
  const cv2CopyBtn = document.getElementById("cv2CopyBtn");

  const typeNames = {
    text: { label: "📝 نص" },
    actionRow: { label: "🔘 أزرار" },
    select: { label: "📋 قائمة" },
    separator: { label: "➖ فاصل" },
    section: { label: "📌 Section" },
  };

  const styleOptions = ["Primary", "Secondary", "Success", "Danger"];

  function uid() {
    return Math.random().toString(36).slice(2, 8);
  }

  function openModal(type, existingData) {
    currentType = type;
    editingId = existingData ? existingData.id : null;

    modalTitle.textContent =
      (editingId ? "عدّل" : "ضيف") + " — " + typeNames[type].label;

    if (type === "text") {
      modalBody.innerHTML = `
        <div class="control-group">
          <label>النص</label>
          <textarea id="mfContent">${existingData ? existingData.content : ""}</textarea>
        </div>`;
    } else if (type === "separator") {
      modalBody.innerHTML = `<p>الفاصل مفيش له إعدادات.</p>`;
    } else if (type === "section") {
      modalBody.innerHTML = `
        <div class="control-group">
          <label>النص</label>
          <textarea id="mfSectionContent">${existingData ? existingData.content : ""}</textarea>
        </div>`;
    } else if (type === "actionRow") {
      const btns = existingData
        ? existingData.buttons
        : [{ id: uid(), label: "زر", style: "Primary" }];

      modalBody.innerHTML = `<div id="mfBtnList"></div>`;
      const list = document.getElementById("mfBtnList");
      btns.forEach((b) => appendBtnRow(list, b));
    } else if (type === "select") {
      const opts = existingData
        ? existingData.options
        : [{ label: "خيار 1", value: "option_1" }];

      modalBody.innerHTML = `<div id="mfOptList"></div>`;
      const list = document.getElementById("mfOptList");
      opts.forEach((o) => appendOptRow(list, o));
    }

    modal.classList.add("open");
  }

  function appendBtnRow(container, btn) {
    const div = document.createElement("div");
    div.innerHTML = `
      <input value="${btn.id}" />
      <input value="${btn.label}" />
      <select>${styleOptions.map(s => `<option>${s}</option>`).join("")}</select>
      <button>✕</button>
    `;
    container.appendChild(div);
  }

  function appendOptRow(container, opt) {
    const div = document.createElement("div");
    div.innerHTML = `
      <input value="${opt.label}" />
      <input value="${opt.value}" />
      <button>✕</button>
    `;
    container.appendChild(div);
  }

  function collectData() {
    if (currentType === "text") {
      return { content: document.getElementById("mfContent").value };
    }
    if (currentType === "section") {
      return { content: document.getElementById("mfSectionContent").value };
    }
    if (currentType === "actionRow") {
      return { buttons: [] };
    }
    if (currentType === "select") {
      return { options: [] };
    }
    return {};
  }

  modalSave.onclick = () => {
    const data = collectData();

    if (editingId) {
      const idx = state.findIndex((i) => i.id === editingId);
      state[idx].data = data;
    } else {
      state.push({ id: uid(), type: currentType, data });
    }

    modal.classList.remove("open");
    render();
  };

  function render() {
    cv2List.innerHTML = state
      .map((item) => `<div>${typeNames[item.type].label}</div>`)
      .join("");

    cv2Preview.innerHTML = state
      .map((item) => `<div>${item.data.content || ""}</div>`)
      .join("");

    cv2Code.textContent = "const container = new ContainerBuilder()...";
  }

  cv2CopyBtn.onclick = () => copyText(cv2Code.textContent, cv2CopyBtn);
})();
