
"use strict";

// XUDBIN OYNA — REBELLIOUS WINDOW
// Muallif: AKRAMJONOVA JADRA MARATOVNA

const desktop = document.getElementById("desktop");
const windowLayer = document.getElementById("windowLayer");
const notification = document.getElementById("notification");
const notificationText = document.getElementById("notificationText");
const exitOverlay = document.getElementById("exitOverlay");

const escapeCountElement = document.getElementById("escapeCount");
const cloneCountElement = document.getElementById("cloneCount");
const scoreElement = document.getElementById("score");
const statusText = document.getElementById("statusText");
const windowLabel = document.getElementById("windowLabel");
const clock = document.getElementById("clock");
const exitSummary = document.getElementById("exitSummary");

const restartBtn = document.getElementById("restartBtn");
const modeButtons = document.querySelectorAll(".mode-btn");

let mode = "jump";
let escapeCount = 0;
let cloneCount = 1;
let score = 0;
let nextWindowId = 2;
let gameEnded = false;
let notificationTimer = null;

const maxWindows = 8;

const jokes = [
  "Meni yopa olmaysan! 😈",
  "X ni bosdingmi? Men qochdim! 😂",
  "Yana urinib ko‘r, qahramon!",
  "Bu oyna hali taslim bo‘lgani yo‘q!",
  "Voy, yana qochib ketdim! ⚡",
  "Men oddiy oyna emasman!",
  "Yopish tugmasi bugun ta'tilda! 🤪",
  "Seni kutib turmayman, xayr!",
  "Qani, yana bir marta urinib ko‘r!"
];

const cloneMessages = [
  "Men yolg‘iz emasman! 😈",
  "Mana, yana bitta men!",
  "Ko‘payish vaqti keldi! ⚡",
  "Endi qaysi birimizni yopasan? 😂",
  "Nusxalarim bilan tanish!"
];

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomItem(array) {
  return array[randomInt(array.length)];
}

function updateStats() {
  escapeCountElement.textContent = escapeCount;
  cloneCountElement.textContent = cloneCount;
  scoreElement.textContent = score;

  windowLabel.textContent =
    `${cloneCount} TA OYNA ${cloneCount === 1 ? "OCHIQ" : "OCHIQ"}`;
}

function showNotification(text) {
  if (gameEnded) return;

  notificationText.textContent = text;
  notification.classList.remove("hidden");

  clearTimeout(notificationTimer);

  notificationTimer = setTimeout(() => {
    notification.classList.add("hidden");
  }, 2200);
}

function randomWindowPosition(windowElement) {
  const desktopRect = desktop.getBoundingClientRect();

  const width = windowElement.offsetWidth;
  const height = windowElement.offsetHeight;

  const padding = 12;
  const availableWidth = Math.max(
    0,
    desktopRect.width - width - padding * 2
  );
  const availableHeight = Math.max(
    0,
    desktopRect.height - height - 55 - padding
  );

  const x = padding + Math.random() * availableWidth;
  const y = 38 + Math.random() * availableHeight;

  windowElement.style.left = `${x + width / 2}px`;
  windowElement.style.top = `${y + height / 2}px`;
  windowElement.style.transform = "translate(-50%, -50%)";
}

function jumpWindow(windowElement) {
  if (gameEnded || !windowElement.isConnected) return;

  windowElement.classList.remove("jumping");
  void windowElement.offsetWidth;

  randomWindowPosition(windowElement);
  windowElement.classList.add("jumping");

  escapeCount++;
  score += 1;

  updateStats();
  showNotification(randomItem(jokes));
}

function getWindowCount() {
  return windowLayer.querySelectorAll(".fake-window").length;
}

function updateCloneLabels() {
  const windows = windowLayer.querySelectorAll(".fake-window");

  windows.forEach((windowElement, index) => {
    const title = windowElement.querySelector(".window-title");
    const heading = windowElement.querySelector(".window-content h3");

    if (title) {
      title.textContent = index === 0
        ? "XudbinOyna.exe"
        : `XudbinOyna_${index + 1}.exe`;
    }

    if (heading) {
      heading.textContent = index === 0
        ? "NIMA QILYAPSAN?!"
        : "MENING NUSXAM!";
    }
  });
}

function createClone() {
  if (gameEnded) return;

  const existingWindows = windowLayer.querySelectorAll(".fake-window");

  if (existingWindows.length >= maxWindows) {
    showNotification("Yetar! 8 tadan ortiq nusxa bo‘lmaydi! 😂");
    return;
  }

  const source = existingWindows[0];
  if (!source) return;

  const clone = source.cloneNode(true);

  clone.dataset.windowId = String(nextWindowId++);
  clone.classList.remove("jumping", "shake", "minimized");
  clone.style.width = "";
  clone.style.zIndex = String(nextWindowId);

  // Yangi oyna boshqa joyda paydo bo‘ladi.
  windowLayer.appendChild(clone);
  randomWindowPosition(clone);

  cloneCount = getWindowCount();
  score += 2;

  updateCloneLabels();
  updateStats();

  showNotification(randomItem(cloneMessages));
}

function handleCloseAttempt(windowElement) {
  if (gameEnded || !windowElement.isConnected) return;

  if (mode === "jump") {
    jumpWindow(windowElement);
    return;
  }

  if (mode === "clone") {
    createClone();

    // Nusxa ko‘paygach, asl oyna ham qochib ketadi.
    jumpWindow(windowElement);
    return;
  }

  // Aralash rejim: har xil xatti-harakatlar.
  if (Math.random() < 0.5) {
    jumpWindow(windowElement);
  } else {
    createClone();
    jumpWindow(windowElement);
  }
}

// Barcha oynalarning tugmalarini bitta joydan boshqaramiz.
windowLayer.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || gameEnded) return;

  const windowElement = button.closest(".fake-window");
  if (!windowElement) return;

  if (button.classList.contains("close-btn")) {
    handleCloseAttempt(windowElement);
    return;
  }

  if (button.classList.contains("challenge-btn")) {
    handleCloseAttempt(windowElement);
    return;
  }

  if (button.classList.contains("minimize-btn")) {
    // Oynani butunlay yo‘qotmaymiz: u kichik holatga kiradi.
    const minimized = windowElement.classList.toggle("minimized");

    if (minimized) {
      showNotification("Yashirindim! Pastdagi oynani qayta top! 😏");
      createRestoreChip(windowElement);
    }

    return;
  }

  if (button.classList.contains("maximize-btn")) {
    const maximized = windowElement.dataset.maximized === "true";

    if (maximized) {
      windowElement.dataset.maximized = "false";
      windowElement.style.width = "";
      randomWindowPosition(windowElement);
      showNotification("Mayli, avvalgi o‘lchamimga qaytdim!");
    } else {
      windowElement.dataset.maximized = "true";
      windowElement.style.width =
        `${Math.max(240, desktop.clientWidth - 32)}px`;
      windowElement.style.left = "50%";
      windowElement.style.top = "53%";
      windowElement.style.transform = "translate(-50%, -50%)";
      showNotification("Voy! Meni kattalashtirding! 😳");
    }

    return;
  }
});

// Kichraytirilgan oynani qayta tiklash uchun kichik belgi.
function createRestoreChip(windowElement) {
  let chip = document.querySelector(
    `[data-restore-id="${windowElement.dataset.windowId}"]`
  );

  if (chip) return;

  chip = document.createElement("button");
  chip.type = "button";
  chip.className = "restore-chip";
  chip.dataset.restoreId = windowElement.dataset.windowId;
  chip.textContent = "▣ " + (
    windowElement.querySelector(".window-title")?.textContent ||
    "Yashirilgan oyna"
  );

  chip.style.cssText = `
    position: absolute;
    bottom: 12px;
    left: 12px;
    z-index: 60;
    max-width: calc(100% - 24px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 9px 12px;
    border: 1px solid #b88600;
    border-radius: 6px;
    background: #171306;
    color: #fff3a3;
    cursor: pointer;
    font-size: 11px;
  `;

  chip.addEventListener("click", () => {
    windowElement.classList.remove("minimized");
    chip.remove();

    randomWindowPosition(windowElement);
    showNotification("Qaytdim! Meni sog‘indingmi? 😈");
  });

  desktop.appendChild(chip);
}

// Oyna sarlavhasini ushlab sudrab harakatlantirish.
let dragState = null;

windowLayer.addEventListener("pointerdown", (event) => {
  if (gameEnded) return;

  const titlebar = event.target.closest(".window-titlebar");
  if (!titlebar) return;

  if (event.target.closest("button")) return;

  const windowElement = titlebar.closest(".fake-window");
  if (!windowElement || windowElement.classList.contains("minimized")) {
    return;
  }

  const desktopRect = desktop.getBoundingClientRect();
  const windowRect = windowElement.getBoundingClientRect();

  dragState = {
    windowElement,
    pointerId: event.pointerId,
    offsetX: event.clientX - windowRect.left,
    offsetY: event.clientY - windowRect.top,
    desktopRect
  };

  titlebar.style.cursor = "grabbing";
  titlebar.setPointerCapture(event.pointerId);
});

windowLayer.addEventListener("pointermove", (event) => {
  if (!dragState || event.pointerId !== dragState.pointerId) return;

  const { windowElement, offsetX, offsetY, desktopRect } = dragState;

  const width = windowElement.offsetWidth;
  const height = windowElement.offsetHeight;

  let x = event.clientX - desktopRect.left - offsetX;
  let y = event.clientY - desktopRect.top - offsetY;

  x = Math.max(0, Math.min(x, desktop.clientWidth - width));
  y = Math.max(28, Math.min(y, desktop.clientHeight - height));

  windowElement.style.left = `${x + width / 2}px`;
  windowElement.style.top = `${y + height / 2}px`;
  windowElement.style.transform = "translate(-50%, -50%)";
});

function stopDragging() {
  if (!dragState) return;

  const titlebar = dragState.windowElement.querySelector(".window-titlebar");
  if (titlebar) titlebar.style.cursor = "";

  dragState = null;
}

windowLayer.addEventListener("pointerup", stopDragging);
windowLayer.addEventListener("pointercancel", stopDragging);

// Rejimlarni tanlash.
modeButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (gameEnded) return;

    mode = button.dataset.mode;

    modeButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    const labels = {
      jump: "Qochish rejimi yoqildi! ↗",
      clone: "Ko‘payish rejimi yoqildi! ⊞",
      both: "Aralash rejim yoqildi! ⚡"
    };

    showNotification(labels[mode]);
  });
});

// Vaqtni ko‘rsatish.
function updateClock() {
  const now = new Date();

  clock.textContent = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ].join(":");
}

updateClock();
setInterval(updateClock, 1000);

// Maxsus xavfsiz chiqish: Ctrl + Shift + Q.
document.addEventListener("keydown", (event) => {
  if (
    event.ctrlKey &&
    event.shiftKey &&
    event.key.toLowerCase() === "q"
  ) {
    event.preventDefault();
    finishGame();
  }
});

function finishGame() {
  if (gameEnded) return;

  gameEnded = true;

  clearTimeout(notificationTimer);
  notification.classList.add("hidden");

  statusText.textContent = "YAKUNLANDI";
  statusText.style.color = "#ffd21f";

  exitSummary.textContent =
    `Sen ${escapeCount} marta qochishimga sabab bo‘lding. ` +
    `Jami ochko: ${score}. Oyna nusxalari: ${cloneCount}.`;

  exitOverlay.classList.remove("hidden");
}

function restartGame() {
  gameEnded = false;
  mode = "jump";
  escapeCount = 0;
  score = 0;
  nextWindowId = 2;

  // Oldingi nusxalarni olib tashlash.
  windowLayer.innerHTML = "";

  // Asl oynani yangidan yaratish uchun HTML shabloni.
  const mainWindow = document.createElement("article");
  mainWindow.className = "fake-window main-window";
  mainWindow.dataset.windowId = "1";

  mainWindow.innerHTML = `
    <div class="window-titlebar">
      <div class="window-app-icon">X</div>
      <span class="window-title">XudbinOyna.exe</span>
      <div class="window-controls">
        <button class="window-control minimize-btn" type="button"
          aria-label="Oynani kichraytirish" title="Kichraytirish">−</button>
        <button class="window-control maximize-btn" type="button"
          aria-label="Oynani kattalashtirish" title="Kattalashtirish">□</button>
        <button class="window-control close-btn" type="button"
          aria-label="Oynani yopishga urinish" title="Yopishga urinish">×</button>
      </div>
    </div>
    <div class="window-content">
      <div class="robot-face">ಠ‿ಠ</div>
      <h3>NIMA QILYAPSAN?!</h3>
      <p>Meni yopmoqchimisan? Avval meni tut! 😏</p>
      <button class="challenge-btn" type="button">MENI YOP! ×</button>
      <div class="window-bottom">
        <span class="window-indicator"></span>
        <span>YOPILISHGA QARSHILIK: FAOL</span>
      </div>
    </div>
  `;

  windowLayer.appendChild(mainWindow);

  // Eski kichraytirilgan oyna belgilarini tozalash.
  desktop.querySelectorAll(".restore-chip").forEach(chip => chip.remove());

  cloneCount = 1;

  modeButtons.forEach(button => {
    const active = button.dataset.mode === "jump";
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  statusText.textContent = "FAOL";
  exitOverlay.classList.add("hidden");

  updateStats();
  randomWindowPosition(mainWindow);
  showNotification("Qaytdim! Meni yana yopib ko‘r! 😈");
}

restartBtn.addEventListener("click", restartGame);

// Dastlabki oynani joylashtirish.
const initialWindow = windowLayer.querySelector(".fake-window");

if (initialWindow) {
  randomWindowPosition(initialWindow);
}

updateStats();

modeButtons.forEach(button => {
  button.setAttribute(
    "aria-pressed",
    String(button.dataset.mode === mode)
  );
});
