/* ==========================================================================
   RETRO DESKTOP — script.js
   ========================================================================== */

const ICONS = [
  { id: "my-computer", label: "My Computer", icon: "assets/icons/my-computer.png" },
  { id: "my-documents", label: "My Documents", icon: "assets/icons/my-documents.png" },
  { id: "internet-explorer", label: "Internet Explorer", icon: "assets/icons/internet-explorer.png" },
  { id: "notepad", label: "Notepad", icon: "assets/icons/notepad.png" },
  { id: "recycle-bin", label: "Recycle Bin", icon: "assets/icons/recycle-bin.png" },
  { id: "media-player", label: "Media Player", icon: "assets/icons/media-player.png" },
  { id: "control-panel", label: "Control Panel", icon: "assets/icons/control-panel.png" },
  { id: "mysterious", label: "???", icon: "assets/icons/mysterious.png" },
];

const PHOTOS = [
  "assets/photos/photo01.jpg",
  "assets/photos/photo02.jpg",
  "assets/photos/photo03.jpg",
  "assets/photos/photo04.jpg",
];

const LETTERS = [
  {
    name: "letter01.txt",
    title: "Letter 01",
    src: "assets/letters/letter01.txt",
  },
  {
    name: "letter02.txt",
    title: "Letter 02",
    src: "assets/letters/letter02.txt",
  },
];

const MUSIC_TRACK = {
  title: "Sweet Things — placeholder.wav",
  src: "assets/music/placeholder.wav",
};

const MUSIC_TRACKS = [
  {
    name: "placeholder.wav",
    title: "Untitled Track",
    src: "assets/music/placeholder.wav",
  },
];

const RANDOM_PHOTOS = [
  "assets/random/random1.jpg",
  "assets/random/random2.jpg",
  "assets/random/random3.jpg",
  "assets/random/random4.jpg",
  "assets/random/random5.jpg",
  "assets/random/random6.jpg",
  "assets/random/random7.jpg",
];

const RECYCLE_BIN_FILES = [
  { name: "old_homework.txt", size: "2 KB" },
  { name: "final_final_FINAL.mp3", size: "4.1 MB" },
  { name: "dont_open.txt", size: "1 KB" },
  { name: "definitely_not_important.jpg", size: "812 KB" },
];

/* ==========================================================================
   STATE
   ========================================================================== */

const state = {
  windows: {},
  zCounter: 100,
  activeWindowId: null,
  windowCounter: 0,
};

/* ==========================================================================
   BOOT SEQUENCE
   ========================================================================== */

function runBootSequence() {
  const biosEl = document.getElementById("bios-text");
  const winLoading = document.getElementById("win-loading");
  const bootScreen = document.getElementById("boot-screen");
  const desktop = document.getElementById("desktop");

  const biosLines = [
    "RetroBIOS (C) 1999 Generic Computing Inc.",
    "CPU: Pentium-Class Processor  Cache: 512K",
    "Memory Test: 65536K OK",
    "",
    "Detecting IDE drives...",
    "  Primary Master   : GENERIC HDD 4.3GB",
    "  Primary Slave    : GENERIC CD-ROM",
    "",
    "Press DEL to enter SETUP, or wait to continue...",
    "",
    "Booting from Primary Master...",
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let currentText = "";

  function typeNextChar() {
    if (lineIndex >= biosLines.length) {
      setTimeout(() => {
        biosEl.parentElement.style.display = "none";
        winLoading.classList.remove("hidden");
        setTimeout(finishBoot, 1900);
      }, 500);
      return;
    }

    const line = biosLines[lineIndex];

    if (charIndex <= line.length) {
      currentText =
        biosLines.slice(0, lineIndex).join("\n") +
        (lineIndex > 0 ? "\n" : "") +
        line.slice(0, charIndex);

      biosEl.textContent = currentText;
      charIndex++;

      setTimeout(
        typeNextChar,
        line.length === 0 ? 40 : 8
      );
    } else {
      lineIndex++;
      charIndex = 0;

      setTimeout(typeNextChar, 60);
    }
  }

  function finishBoot() {
    bootScreen.classList.add("hidden");
    desktop.classList.remove("hidden");
    playSound("sfx-startup");
  }

  typeNextChar();
}

/* ==========================================================================
   DESKTOP ICONS
   ========================================================================== */

function renderDesktopIcons() {
  const container = document.getElementById("desktop-icons");

  container.innerHTML = "";

  ICONS.forEach((icon) => {
    const el = document.createElement("div");

    el.className = "desktop-icon";
    el.dataset.iconId = icon.id;

    el.innerHTML = `
      <img src="${icon.icon}" alt="">
      <span>${icon.label}</span>
    `;

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      selectIcon(el);
    });

    el.addEventListener("dblclick", (e) => {
      e.stopPropagation();

      playSound("sfx-click");

      openWindow(
        icon.id,
        icon.label,
        icon.icon
      );
    });

    let lastTap = 0;

    el.addEventListener("touchend", (e) => {
      const now = Date.now();

      if (now - lastTap < 350) {
        e.preventDefault();

        playSound("sfx-click");

        openWindow(
          icon.id,
          icon.label,
          icon.icon
        );
      }

      lastTap = now;
    });

    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();

      selectIcon(el);

      showContextMenu(
        "icon-context-menu",
        e.clientX,
        e.clientY,
        icon
      );
    });

    container.appendChild(el);
  });
}

function selectIcon(el) {
  document
    .querySelectorAll(".desktop-icon")
    .forEach((i) =>
      i.classList.remove("selected")
    );

  el.classList.add("selected");
}

/* ==========================================================================
   WINDOW MANAGER
   ========================================================================== */

function openWindow(appId, title, iconSrc) {
  const existingId = Object.keys(state.windows).find(
    (id) =>
      state.windows[id].appId === appId
  );

  if (existingId) {
    restoreWindow(existingId);
    focusWindow(existingId);
    return;
  }

  const winId =
    "win-" + ++state.windowCounter;

  const layer =
    document.getElementById("windows-layer");

  const winEl =
    document.createElement("div");

  winEl.className = "win-window";
  winEl.dataset.winId = winId;

  const offset =
    (state.windowCounter % 6) * 22;

  const defaultW = 460;
  const defaultH = 340;

  winEl.style.width =
    defaultW + "px";

  winEl.style.height =
    defaultH + "px";

  winEl.style.left =
    60 + offset + "px";

  winEl.style.top =
    50 + offset + "px";

  winEl.innerHTML = `
    <div class="win-titlebar" data-role="titlebar">

      <div class="win-titlebar-title">
        <img src="${iconSrc}" alt="">
        <span>${title}</span>
      </div>

      <div class="win-titlebar-controls">

        <button
          class="win-control-btn"
          data-action="minimize"
          aria-label="Minimize"
        >
          &#95;
        </button>

        <button
          class="win-control-btn"
          data-action="maximize"
          aria-label="Maximize"
        >
          &#9633;
        </button>

        <button
          class="win-control-btn"
          data-action="close"
          aria-label="Close"
        >
          &times;
        </button>

      </div>

    </div>

    <div
      class="win-body-wrapper"
      style="
        flex:1;
        display:flex;
        flex-direction:column;
        min-height:0;
      "
    >
      ${getWindowContent(appId)}
    </div>

    <div
      class="win-resize-handle"
      data-role="resize"
    ></div>
  `;

  layer.appendChild(winEl);

  state.windows[winId] = {
    el: winEl,
    appId,
    title,
    iconSrc,
    minimized: false,
    maximized: false,
    prevRect: null,
  };

  makeDraggable(winEl, winId);
  makeResizable(winEl, winId);
  wireWindowControls(winEl, winId);

  focusWindow(winId);
  addTaskbarEntry(winId);

  initAppBehavior(
    appId,
    winEl,
    winId
  );
}

function closeWindow(winId) {
  const w = state.windows[winId];

  if (!w) return;

  w.el.remove();

  delete state.windows[winId];

  removeTaskbarEntry(winId);

  if (state.activeWindowId === winId) {
    state.activeWindowId = null;
  }
}

function minimizeWindow(winId) {
  const w = state.windows[winId];

  if (!w) return;

  w.minimized = true;
  w.el.style.display = "none";

  updateTaskbarActiveStates();
}

function restoreWindow(winId) {
  const w = state.windows[winId];

  if (!w) return;

  w.minimized = false;
  w.el.style.display = "flex";
}

function toggleMinimize(winId) {
  const w = state.windows[winId];

  if (!w) return;

  if (w.minimized) {
    restoreWindow(winId);
    focusWindow(winId);
  } else {
    minimizeWindow(winId);
  }
}

function maximizeWindow(winId) {
  const w = state.windows[winId];

  if (!w) return;

  if (!w.maximized) {
    w.prevRect = {
      left: w.el.style.left,
      top: w.el.style.top,
      width: w.el.style.width,
      height: w.el.style.height,
    };

    w.el.classList.add("maximized");

    w.maximized = true;
  } else {
    w.el.classList.remove("maximized");

    if (w.prevRect) {
      w.el.style.left =
        w.prevRect.left;

      w.el.style.top =
        w.prevRect.top;

      w.el.style.width =
        w.prevRect.width;

      w.el.style.height =
        w.prevRect.height;
    }

    w.maximized = false;
  }
}

function focusWindow(winId) {
  Object.keys(state.windows).forEach(
    (id) => {
      const w = state.windows[id];

      if (id === winId) {
        w.el.style.zIndex =
          ++state.zCounter;

        w.el.classList.remove(
          "inactive"
        );
      } else {
        w.el.classList.add(
          "inactive"
        );
      }
    }
  );

  state.activeWindowId = winId;

  updateTaskbarActiveStates();
}

function wireWindowControls(
  winEl,
  winId
) {
  winEl.addEventListener(
    "mousedown",
    () => focusWindow(winId)
  );

  winEl.addEventListener(
    "touchstart",
    () => focusWindow(winId),
    { passive: true }
  );

  winEl
    .querySelector(
      '[data-action="close"]'
    )
    .addEventListener(
      "click",
      (e) => {
        e.stopPropagation();

        playSound("sfx-click");

        closeWindow(winId);
      }
    );

  winEl
    .querySelector(
      '[data-action="minimize"]'
    )
    .addEventListener(
      "click",
      (e) => {
        e.stopPropagation();

        playSound("sfx-click");

        minimizeWindow(winId);
      }
    );

  winEl
    .querySelector(
      '[data-action="maximize"]'
    )
    .addEventListener(
      "click",
      (e) => {
        e.stopPropagation();

        playSound("sfx-click");

        maximizeWindow(winId);
      }
    );

  winEl
    .querySelector(
      '[data-role="titlebar"]'
    )
    .addEventListener(
      "dblclick",
      (e) => {
        e.stopPropagation();

        maximizeWindow(winId);
      }
    );
}

function makeDraggable(
  winEl,
  winId
) {
  const titlebar =
    winEl.querySelector(
      '[data-role="titlebar"]'
    );

  let dragging = false;

  let startX;
  let startY;
  let startLeft;
  let startTop;

  function onDown(
    clientX,
    clientY
  ) {
    const w =
      state.windows[winId];

    if (w.maximized) return;

    dragging = true;

    startX = clientX;
    startY = clientY;

    const rect =
      winEl.getBoundingClientRect();

    startLeft = rect.left;
    startTop = rect.top;

    focusWindow(winId);
  }

  function onMove(
    clientX,
    clientY
  ) {
    if (!dragging) return;

    const dx =
      clientX - startX;

    const dy =
      clientY - startY;

    const newLeft =
      startLeft + dx;

    const newTop =
      Math.max(
        0,
        startTop + dy
      );

    winEl.style.left =
      newLeft + "px";

    winEl.style.top =
      newTop + "px";
  }

  function onUp() {
    dragging = false;
  }

  titlebar.addEventListener(
    "mousedown",
    (e) => {
      if (
        e.target.closest(
          ".win-control-btn"
        )
      ) {
        return;
      }

      onDown(
        e.clientX,
        e.clientY
      );
    }
  );

  document.addEventListener(
    "mousemove",
    (e) => {
      onMove(
        e.clientX,
        e.clientY
      );
    }
  );

  document.addEventListener(
    "mouseup",
    onUp
  );

  titlebar.addEventListener(
    "touchstart",
    (e) => {
      if (
        e.target.closest(
          ".win-control-btn"
        )
      ) {
        return;
      }

      const t =
        e.touches[0];

      onDown(
        t.clientX,
        t.clientY
      );
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!dragging) return;

      const t =
        e.touches[0];

      onMove(
        t.clientX,
        t.clientY
      );
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    onUp
  );
}

function makeResizable(
  winEl,
  winId
) {
  const handle =
    winEl.querySelector(
      '[data-role="resize"]'
    );

  let resizing = false;

  let startX;
  let startY;
  let startW;
  let startH;

  function onDown(
    clientX,
    clientY
  ) {
    const w =
      state.windows[winId];

    if (w.maximized) return;

    resizing = true;

    startX = clientX;
    startY = clientY;

    const rect =
      winEl.getBoundingClientRect();

    startW = rect.width;
    startH = rect.height;

    focusWindow(winId);
  }

  function onMove(
    clientX,
    clientY
  ) {
    if (!resizing) return;

    const dx =
      clientX - startX;

    const dy =
      clientY - startY;

    winEl.style.width =
      Math.max(
        240,
        startW + dx
      ) + "px";

    winEl.style.height =
      Math.max(
        150,
        startH + dy
      ) + "px";
  }

  function onUp() {
    resizing = false;
  }

  handle.addEventListener(
    "mousedown",
    (e) => {
      e.stopPropagation();

      onDown(
        e.clientX,
        e.clientY
      );
    }
  );

  document.addEventListener(
    "mousemove",
    (e) => {
      onMove(
        e.clientX,
        e.clientY
      );
    }
  );

  document.addEventListener(
    "mouseup",
    onUp
  );

  handle.addEventListener(
    "touchstart",
    (e) => {
      e.stopPropagation();

      const t =
        e.touches[0];

      onDown(
        t.clientX,
        t.clientY
      );
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!resizing) return;

      const t =
        e.touches[0];

      onMove(
        t.clientX,
        t.clientY
      );
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    onUp
  );
}

/* ==========================================================================
   TASKBAR
   ========================================================================== */

function addTaskbarEntry(
  winId
) {
  const w =
    state.windows[winId];

  const bar =
    document.getElementById(
      "taskbar-windows"
    );

  const item =
    document.createElement("div");

  item.className =
    "taskbar-item";

  item.dataset.winId =
    winId;

  item.innerHTML = `
    <img src="${w.iconSrc}" alt="">
    <span>${w.title}</span>
  `;

  item.addEventListener(
    "click",
    () => {
      playSound("sfx-click");

      const win =
        state.windows[winId];

      if (!win) return;

      if (win.minimized) {
        restoreWindow(winId);
        focusWindow(winId);
      } else if (
        state.activeWindowId ===
        winId
      ) {
        minimizeWindow(winId);
      } else {
        focusWindow(winId);
      }
    }
  );

  bar.appendChild(item);

  updateTaskbarActiveStates();
}

function removeTaskbarEntry(
  winId
) {
  const item =
    document.querySelector(
      `.taskbar-item[data-win-id="${winId}"]`
    );

  if (item) item.remove();
}

function updateTaskbarActiveStates() {
  document
    .querySelectorAll(
      ".taskbar-item"
    )
    .forEach((item) => {
      const id =
        item.dataset.winId;

      const w =
        state.windows[id];

      item.classList.toggle(
        "active",
        !!w &&
          !w.minimized &&
          state.activeWindowId ===
            id
      );
    });
}

function updateClock() {
  const el =
    document.getElementById(
      "taskbar-clock"
    );

  const now =
    new Date();

  let h =
    now.getHours();

  const m =
    now
      .getMinutes()
      .toString()
      .padStart(2, "0");

  const ampm =
    h >= 12
      ? "PM"
      : "AM";

  h =
    h % 12;

  if (h === 0) {
    h = 12;
  }

  el.textContent =
    `${h}:${m} ${ampm}`;
}

/* ==========================================================================
   START MENU
   ========================================================================== */

function wireStartMenu() {
  const startBtn =
    document.getElementById(
      "start-button"
    );

  const startMenu =
    document.getElementById(
      "start-menu"
    );

  startBtn.addEventListener(
    "click",
    (e) => {
      e.stopPropagation();

      playSound("sfx-click");

      const isOpen =
        !startMenu.classList.contains(
          "hidden"
        );

      closeAllMenus();

      if (!isOpen) {
        startMenu.classList.remove(
          "hidden"
        );

        startBtn.classList.add(
          "active"
        );
      }
    }
  );

  startMenu
    .querySelectorAll(
      ".start-item[data-open]"
    )
    .forEach((item) => {
      item.addEventListener(
        "click",
        () => {
          const appId =
            item.dataset.open;

          const config =
            ICONS.find(
              (i) =>
                i.id === appId
            );

          if (config) {
            playSound(
              "sfx-click"
            );

            openWindow(
              config.id,
              config.label,
              config.icon
            );
          }

          closeAllMenus();
        }
      );
    });

  startMenu
    .querySelector(
      '[data-action="shutdown"]'
    )
    .addEventListener(
      "click",
      () => {
        closeAllMenus();

        showDialog(
          "Shut Down",
          "It is now safe to close this browser tab.",
          "info"
        );
      }
    );
}

function closeAllMenus() {
  document
    .getElementById(
      "start-menu"
    )
    .classList.add("hidden");

  document
    .getElementById(
      "start-button"
    )
    .classList.remove(
      "active"
    );

  document
    .getElementById(
      "desktop-context-menu"
    )
    .classList.add("hidden");

  document
    .getElementById(
      "icon-context-menu"
    )
    .classList.add("hidden");
}

/* ==========================================================================
   CONTEXT MENUS
   ========================================================================== */

function showContextMenu(
  menuId,
  x,
  y,
  iconData
) {
  closeAllMenus();

  const menu =
    document.getElementById(
      menuId
    );

  menu.style.left =
    x + "px";

  menu.style.top =
    y + "px";

  menu.classList.remove(
    "hidden"
  );

  menu.dataset.iconId =
    iconData
      ? iconData.id
      : "";
}

function wireContextMenus() {
  document
    .getElementById("desktop")
    .addEventListener(
      "contextmenu",
      (e) => {
        if (
          e.target.closest(
            ".desktop-icon"
          ) ||
          e.target.closest(
            ".win-window"
          )
        ) {
          return;
        }

        e.preventDefault();

        showContextMenu(
          "desktop-context-menu",
          e.clientX,
          e.clientY
        );
      }
    );

  document
    .getElementById(
      "desktop-context-menu"
    )
    .addEventListener(
      "click",
      (e) => {
        const action =
          e.target.dataset.action;

        closeAllMenus();

        if (
          action ===
          "refresh"
        ) {
          showDialog(
            "System",
            "Desktop refreshed.",
            "info"
          );
        } else if (
          action ===
          "new-folder"
        ) {
          showDialog(
            "System",
            "New folder created (this is a placeholder — wire this up when you extend the project).",
            "info"
          );
        } else if (
          action ===
          "properties"
        ) {
          showDialog(
            "Display Properties",
            "800 x 600, 256 Colors. Wallpaper: wallpaper-placeholder.jpg",
            "info"
          );
        } else if (
          action ===
          "arrange"
        ) {
          renderDesktopIcons();
        }
      }
    );

  document
    .getElementById(
      "icon-context-menu"
    )
    .addEventListener(
      "click",
      (e) => {
        const action =
          e.target.dataset.action;

        const menu =
          document.getElementById(
            "icon-context-menu"
          );

        const iconId =
          menu.dataset.iconId;

        closeAllMenus();

        const config =
          ICONS.find(
            (i) =>
              i.id === iconId
          );

        if (!config) return;

        if (
          action ===
          "open"
        ) {
          openWindow(
            config.id,
            config.label,
            config.icon
          );
        } else if (
          action ===
          "delete"
        ) {
          showDialog(
            "Confirm File Delete",
            `Are you sure you want to send '${config.label}' to the Recycle Bin?`,
            "warning"
          );
        } else if (
          action ===
          "rename"
        ) {
          showDialog(
            "System",
            "Renaming is disabled in this placeholder build.",
            "info"
          );
        } else if (
          action ===
          "props"
        ) {
          showDialog(
            config.label +
              " Properties",
            `Type: Application\nLocation: C:\\Desktop\\`,
            "info"
          );
        }
      }
    );

  document.addEventListener(
    "click",
    () =>
      closeAllMenus()
  );

  document
    .getElementById("desktop")
    .addEventListener(
      "click",
      (e) => {
        if (
          !e.target.closest(
            ".desktop-icon"
          )
        ) {
          document
            .querySelectorAll(
              ".desktop-icon"
            )
            .forEach((i) =>
              i.classList.remove(
                "selected"
              )
            );
        }
      }
    );
}

/* ==========================================================================
   DIALOG
   ========================================================================== */

function showDialog(
  title,
  message,
  kind = "info"
) {
  const box =
    document.getElementById(
      "dialog-box"
    );

  document.getElementById(
    "dialog-title"
  ).textContent =
    title;

  document.getElementById(
    "dialog-message"
  ).textContent =
    message;

  const iconEl =
    document.getElementById(
      "dialog-icon"
    );

  iconEl.textContent =
    kind === "warning"
      ? "\u26A0"
      : kind === "error"
      ? "\u274C"
      : "\u2139";

  box.classList.remove(
    "hidden"
  );

  playSound(
    kind === "error"
      ? "sfx-error"
      : "sfx-notify"
  );
}

function wireDialog() {
  document
    .querySelectorAll(
      "[data-close-dialog]"
    )
    .forEach((btn) => {
      btn.addEventListener(
        "click",
        () => {
          document
            .getElementById(
              "dialog-box"
            )
            .classList.add(
              "hidden"
            );
        }
      );
    });
}

/* ==========================================================================
   SOUND
   ========================================================================== */

function playSound(id) {
  const el =
    document.getElementById(id);

  if (!el) return;

  try {
    el.currentTime = 0;
    el.volume = 0.4;

    el.play().catch(
      () => {}
    );
  } catch (err) {}
}

/* ==========================================================================
   APP CONTENT
   ========================================================================== */

function getWindowContent(
  appId
) {
  switch (appId) {

    case "my-computer":
      return `
        <div class="win-address-bar">
          Address:
          <input
            type="text"
            value="My Computer"
            readonly
          >
        </div>

        <div class="win-content">
          <div class="file-grid">

            <div class="file-item">
              <div class="file-icon">
                &#128190;
              </div>
              <span>
                C:\\ Local Disk
              </span>
            </div>

            <div class="file-item">
              <div class="file-icon">
                &#128191;
              </div>
              <span>
                D:\\ Data
              </span>
            </div>

            <div class="file-item">
              <div class="file-icon">
                &#128191;
              </div>
              <span>
                A:\\ Floppy
              </span>
            </div>

          </div>
        </div>

        <div class="win-statusbar">
          3 object(s)
        </div>
      `;

    case "my-documents":
      return `
        <div class="win-address-bar">
          Address:
          <input
            type="text"
            value="My Documents"
            readonly
          >
        </div>

        <div class="win-content">
          <div
            class="file-grid"
            data-role="documents-grid"
          >

            <div
              class="file-item"
              data-folder="Photos"
            >
              <div class="file-icon">
                &#128193;
              </div>
              <span>Photos</span>
            </div>

            <div
              class="file-item"
              data-folder="Music"
            >
              <div class="file-icon">
                &#128193;
              </div>
              <span>Music</span>
            </div>

            <div
              class="file-item"
              data-folder="Letters"
            >
              <div class="file-icon">
                &#128193;
              </div>
              <span>Letters</span>
            </div>

            <div
              class="file-item"
              data-folder="Random"
            >
              <div class="file-icon">
                &#128193;
              </div>
              <span>Random</span>
            </div>

            <div
              class="file-item"
              data-folder="Secret"
            >
              <div class="file-icon">
                &#128193;
              </div>
              <span>Secret</span>
            </div>

          </div>
        </div>

        <div class="win-statusbar">
          5 object(s)
        </div>
      `;

    case "internet-explorer":
      return `
        <div class="win-address-bar">
          Address:
          <input
            type="text"
            value="about:blank"
            readonly
          >
        </div>

        <div
          class="win-content"
          style="
            display:flex;
            align-items:center;
            justify-content:center;
            flex-direction:column;
            gap:8px;
            color:#555;
          "
        >
          <div style="font-size:40px;">
            &#128268;
          </div>

          <p>
            This page cannot be displayed.
          </p>

          <p style="font-size:11px;">
            There is no internet connection
            on this computer.
          </p>
        </div>

        <div class="win-statusbar">
          Done
        </div>
      `;

    case "notepad":
      return `
        <div class="win-menubar">
          <span>File</span>
          <span>Edit</span>
          <span>Format</span>
          <span>View</span>
          <span>Help</span>
        </div>

        <textarea
          class="notepad-textarea"
          spellcheck="false"
        >Hi! I love you, my beautiful baby.

You're the strongest person I know. Genuinely. In all of the fucking universe.

(I will love you forever.)</textarea>
      `;

    case "recycle-bin":
      return `
        <div class="win-address-bar">
          Address:
          <input
            type="text"
            value="Recycle Bin"
            readonly
          >
        </div>

        <div class="win-content">
          <div
            class="file-grid"
            data-role="recycle-grid"
          ></div>
        </div>

        <div class="win-statusbar">
          ${RECYCLE_BIN_FILES.length}
          object(s)
        </div>
      `;

    case "media-player":
      return `
        <div
          class="win-content"
          style="
            padding:0;
            margin:0;
            border:none;
          "
        >
          <div class="media-player-body">

            <div class="media-screen">

              <div
                class="media-track-name"
                data-role="track-name"
              >
                ${MUSIC_TRACK.title}
              </div>

              <div
                class="media-visualizer"
                data-role="visualizer"
              ></div>

            </div>

            <div class="media-controls">

              <button
                class="media-btn"
                data-action="play"
              >
                &#9654;
              </button>

              <button
                class="media-btn"
                data-action="pause"
              >
                &#10074;&#10074;
              </button>

              <button
                class="media-btn"
                data-action="stop"
              >
                &#9632;
              </button>

            </div>

            <audio
              data-role="audio"
              src="${MUSIC_TRACK.src}"
              preload="auto"
            ></audio>

          </div>
        </div>
      `;

    case "control-panel":
      return `
        <div class="win-content">

          <div class="control-panel-grid">

            <div class="control-panel-item">
              <div class="cp-icon">
                &#128421;
              </div>
              <span>Display</span>
            </div>

            <div class="control-panel-item">
              <div class="cp-icon">
                &#128266;
              </div>
              <span>Sounds</span>
            </div>

            <div class="control-panel-item">
              <div class="cp-icon">
                &#128421;&#65039;
              </div>
              <span>Mouse</span>
            </div>

            <div class="control-panel-item">
              <div class="cp-icon">
                &#8987;
              </div>
              <span>Date/Time</span>
            </div>

            <div class="control-panel-item">
              <div class="cp-icon">
                &#127760;
              </div>
              <span>Network</span>
            </div>

            <div class="control-panel-item">
              <div class="cp-icon">
                &#128100;
              </div>
              <span>Users</span>
            </div>

          </div>

        </div>
      `;

    case "mysterious":
      return `
        <div
          class="win-content"
          style="
            padding:0;
            margin:0;
            border:none;
          "
        >
          <div
            class="mysterious-body"
            data-role="mysterious-body"
          >
            <span
              data-role="mysterious-text"
            ></span>

            <span
              class="mysterious-cursor"
            ></span>
          </div>
        </div>
      `;

    default:
      return `
        <div class="win-content">
          <p>
            Unknown application.
          </p>
        </div>
      `;
  }
}

/* ==========================================================================
   APP-SPECIFIC BEHAVIOR
   ========================================================================== */

function initAppBehavior(
  appId,
  winEl,
  winId
) {

  /* ---------------- MY DOCUMENTS ---------------- */

  if (appId === "my-documents") {

    winEl
      .querySelectorAll(
        "[data-folder]"
      )
      .forEach((el) => {

        el.addEventListener(
          "dblclick",
          () => {

            const folder =
              el.dataset.folder;

            if (
              folder ===
              "Photos"
            ) {

              openWindow(
                "photos-viewer",
                "Photos",
                "assets/icons/my-documents.png"
              );

            } else if (
              folder ===
              "Letters"
            ) {

              openLettersWindow();

            } else if (
              folder ===
              "Music"
            ) {

              openMusicFolderWindow();

            } else if (
              folder ===
              "Random"
            ) {

              openRandomFolderWindow();

            } else if (
              folder ===
              "Secret"
            ) {

              openSecretWindow();

            } else {

              showDialog(
                "Open Folder",
                `'${folder}' is empty for now. Add your own files here later.`,
                "info"
              );
            }
          }
        );
      });
  }

  /* ---------------- LETTERS FOLDER ---------------- */

  if (
    appId ===
    "letters-folder"
  ) {

    const grid =
      winEl.querySelector(
        '[data-role="letters-grid"]'
      );

    if (!LETTERS.length) {

      grid.innerHTML = `
        <div
          style="
            padding:20px;
            color:#555;
          "
        >
          This folder is empty.
        </div>
      `;
    }

    LETTERS.forEach(
      (letter) => {

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "file-item";

        item.innerHTML = `
          <div class="file-icon">
            &#128196;
          </div>

          <span>
            ${letter.title}
          </span>
        `;

        item.addEventListener(
          "dblclick",
          () => {

            playSound(
              "sfx-click"
            );

            openLetterWindow(
              letter
            );
          }
        );

        grid.appendChild(item);
      }
    );
  }

  /* ---------------- INDIVIDUAL LETTER ---------------- */

  if (
    appId.startsWith(
      "letter-"
    )
  ) {

    const fileName =
      appId.slice(
        "letter-".length
      );

    const letter =
      LETTERS.find(
        (item) =>
          item.name ===
          fileName
      );

    if (letter) {

      const textarea =
        winEl.querySelector(
          '[data-role="letter-text"]'
        );

      fetch(letter.src)
        .then(
          (response) => {

            if (!response.ok) {
              throw new Error(
                "Letter file could not be loaded."
              );
            }

            return response.text();
          }
        )
        .then(
          (content) => {
            textarea.value =
              content;
          }
        )
        .catch(
          () => {
            textarea.value =
              "Could not open this letter.\n\n" +
              "Make sure the file exists at:\n" +
              letter.src;
          }
        );
    }
  }

  /* ---------------- MUSIC FOLDER ---------------- */

  if (
    appId ===
    "music-folder"
  ) {

    const grid =
      winEl.querySelector(
        '[data-role="music-grid"]'
      );

    MUSIC_TRACKS.forEach(
      (track) => {

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "file-item";

        item.innerHTML = `
          <div class="file-icon">
            &#127925;
          </div>

          <span>
            ${track.name}
          </span>
        `;

        item.addEventListener(
          "dblclick",
          () => {

            playSound(
              "sfx-click"
            );

            openWindow(
              "media-player",
              "Media Player",
              "assets/icons/media-player.png"
            );
          }
        );

        grid.appendChild(item);
      }
    );
  }

  /* ---------------- RANDOM PHOTO FOLDER ---------------- */

  if (
    appId ===
    "random-folder"
  ) {

    const grid =
      winEl.querySelector(
        '[data-role="random-grid"]'
      );

    RANDOM_PHOTOS.forEach(
      (src, index) => {

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "file-item";

        const fileName =
          `random${String(
            index + 1
          ).padStart(
            2,
            "0"
          )}.jpg`;

        item.innerHTML = `
          <div class="file-icon">
            &#128247;
          </div>

          <span>
            ${fileName}
          </span>
        `;

        item.addEventListener(
          "dblclick",
          () => {

            playSound(
              "sfx-click"
            );

            openRandomPhotoWindow(
              index
            );
          }
        );

        grid.appendChild(item);
      }
    );
  }

  /* ---------------- RANDOM PHOTO VIEWER ---------------- */

  if (
    appId ===
    "random-photo"
  ) {

    const img =
      winEl.querySelector(
        '[data-role="random-photo-img"]'
      );

    const status =
      winEl.querySelector(
        '[data-role="random-photo-status"]'
      );

    let idx =
      Number(
        winEl.dataset.photoIndex ||
        0
      );

    function updateRandomPhoto() {

      img.src =
        RANDOM_PHOTOS[idx];

      status.textContent =
        `Photo ${
          idx + 1
        } of ${
          RANDOM_PHOTOS.length
        }`;
    }

    const prev =
      winEl.querySelector(
        '[data-action="random-prev"]'
      );

    const next =
      winEl.querySelector(
        '[data-action="random-next"]'
      );

    if (prev) {
      prev.addEventListener(
        "click",
        () => {

          idx =
            (
              idx -
              1 +
              RANDOM_PHOTOS.length
            ) %
            RANDOM_PHOTOS.length;

          updateRandomPhoto();
        }
      );
    }

    if (next) {
      next.addEventListener(
        "click",
        () => {

          idx =
            (
              idx +
              1
            ) %
            RANDOM_PHOTOS.length;

          updateRandomPhoto();
        }
      );
    }

    updateRandomPhoto();
  }

  /* ---------------- SECRET ---------------- */

  if (
    appId ===
    "secret-folder"
  ) {

    const button =
      winEl.querySelector(
        '[data-action="secret-open"]'
      );

    const message =
      winEl.querySelector(
        '[data-role="secret-message"]'
      );

    if (button) {

      button.addEventListener(
        "click",
        () => {

          playSound(
            "sfx-click"
          );

          button.style.display =
            "none";

          message.style.display =
            "block";

          typeSecretMessage(
            message
          );
        }
      );
    }
  }

  /* ---------------- RECYCLE BIN ---------------- */

  if (
    appId ===
    "recycle-bin"
  ) {

    const grid =
      winEl.querySelector(
        '[data-role="recycle-grid"]'
      );

    RECYCLE_BIN_FILES.forEach(
      (file) => {

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "file-item";

        item.innerHTML = `
          <div class="file-icon">
            &#128220;
          </div>

          <span>
            ${file.name}
          </span>
        `;

        item.addEventListener(
          "dblclick",
          () => {

            showDialog(
              "Cannot Restore",
              `'${file.name}' (${file.size}) is too legendary to restore.`,
              "warning"
            );
          }
        );

        grid.appendChild(item);
      }
    );
  }

  /* ---------------- MEDIA PLAYER ---------------- */

  if (
    appId ===
    "media-player"
  ) {

    const audio =
      winEl.querySelector(
        '[data-role="audio"]'
      );

    const viz =
      winEl.querySelector(
        '[data-role="visualizer"]'
      );

    for (
      let i = 0;
      i < 24;
      i++
    ) {

      const bar =
        document.createElement(
          "span"
        );

      viz.appendChild(bar);
    }

    let vizTimer =
      null;

    function animateViz() {

      viz
        .querySelectorAll(
          "span"
        )
        .forEach(
          (bar) => {

            const h =
              audio.paused
                ? 20
                : 20 +
                  Math.random() *
                    80;

            bar.style.height =
              h + "%";
          }
        );
    }

    winEl
      .querySelector(
        '[data-action="play"]'
      )
      .addEventListener(
        "click",
        () => {

          audio
            .play()
            .catch(
              () =>
                showDialog(
                  "Playback Error",
                  "Couldn't play the placeholder track. Add your own MP3/WAV to assets/music/.",
                  "error"
                )
            );

          clearInterval(
            vizTimer
          );

          vizTimer =
            setInterval(
              animateViz,
              120
            );
        }
      );

    winEl
      .querySelector(
        '[data-action="pause"]'
      )
      .addEventListener(
        "click",
        () => {
          audio.pause();
        }
      );

    winEl
      .querySelector(
        '[data-action="stop"]'
      )
      .addEventListener(
        "click",
        () => {

          audio.pause();

          audio.currentTime =
            0;

          clearInterval(
            vizTimer
          );

          viz
            .querySelectorAll(
              "span"
            )
            .forEach(
              (bar) =>
                (bar.style.height =
                  "20%")
            );
        }
      );
  }

  /* ---------------- PHOTOS ---------------- */

  if (
    appId ===
    "photos-viewer"
  ) {
    // handled below
  }

  /* ---------------- MYSTERIOUS ---------------- */

  if (
    appId ===
    "mysterious"
  ) {
    typeMysteriousText(
      winEl
    );
  }
}

/* ==========================================================================
   LETTERS
   ========================================================================== */

function openLettersWindow() {
  openWindow(
    "letters-folder",
    "Letters",
    "assets/icons/my-documents.png"
  );
}

function openLetterWindow(
  letter
) {
  openWindow(
    "letter-" +
      letter.name,
    letter.title,
    "assets/icons/notepad.png"
  );
}

function openLettersWindowBody() {
  return `
    <div class="win-address-bar">
      Address:
      <input
        type="text"
        value="My Documents\\Letters"
        readonly
      >
    </div>

    <div class="win-content">
      <div
        class="file-grid"
        data-role="letters-grid"
      ></div>
    </div>

    <div class="win-statusbar">
      ${LETTERS.length}
      object(s)
    </div>
  `;
}

function openLetterWindowBody() {
  return `
    <div class="win-menubar">
      <span>File</span>
      <span>Edit</span>
      <span>Format</span>
      <span>View</span>
      <span>Help</span>
    </div>

    <textarea
      class="notepad-textarea"
      data-role="letter-text"
      spellcheck="false"
      readonly
    >Loading letter...</textarea>
  `;
}

/* ==========================================================================
   MUSIC
   ========================================================================== */

function openMusicFolderWindow() {
  openWindow(
    "music-folder",
    "Music",
    "assets/icons/media-player.png"
  );
}

function openMusicFolderWindowBody() {
  return `
    <div class="win-address-bar">
      Address:
      <input
        type="text"
        value="My Documents\\Music"
        readonly
      >
    </div>

    <div class="win-content">
      <div
        class="file-grid"
        data-role="music-grid"
      ></div>
    </div>

    <div class="win-statusbar">
      ${MUSIC_TRACKS.length}
      object(s)
    </div>
  `;
}

/* ==========================================================================
   RANDOM
   ========================================================================== */

function openRandomFolderWindow() {
  openWindow(
    "random-folder",
    "Random",
    "assets/icons/my-documents.png"
  );
}

function openRandomFolderWindowBody() {
  return `
    <div class="win-address-bar">
      Address:
      <input
        type="text"
        value="My Documents\\Random"
        readonly
      >
    </div>

    <div class="win-content">
      <div
        class="file-grid"
        data-role="random-grid"
      ></div>
    </div>

    <div class="win-statusbar">
      ${RANDOM_PHOTOS.length}
      object(s)
    </div>
  `;
}

function openRandomPhotoWindow(
  index
) {
  const appId =
    "random-photo";

  openWindow(
    appId,
    `Random Photo ${
      index + 1
    }`,
    "assets/icons/my-documents.png"
  );

  const win =
    Object.values(
      state.windows
    ).find(
      (w) =>
        w.appId ===
        appId
    );

  if (win) {
    win.el.dataset.photoIndex =
      index;
updateRandomPhoto(win.el);
  }
}

function openRandomPhotoWindowBody() {
  return `
    <div
      class="win-content"
      style="
        display:flex;
        flex-direction:column;
        padding:8px;
      "
    >

      <div
        style="
          flex:1;
          min-height:0;
          display:flex;
          align-items:center;
          justify-content:center;
        "
      >

        <img
          data-role="random-photo-img"
          src="${RANDOM_PHOTOS[0]}"
          alt="Random photo"
          style="
            max-width:100%;
            max-height:100%;
            object-fit:contain;
          "
        >

      </div>

      <div
        class="photo-nav"
      >

        <button
          class="win-btn"
          data-action="random-prev"
        >
          &larr; Prev
        </button>

        <button
          class="win-btn"
          data-action="random-next"
        >
          Next &rarr;
        </button>

      </div>

    </div>

    <div
      class="win-statusbar"
      data-role="random-photo-status"
    >
      Photo 1 of ${
        RANDOM_PHOTOS.length
      }
    </div>
  `;
}

/* ==========================================================================
   SECRET
   ========================================================================== */

function openSecretWindow() {
  openWindow(
    "secret-folder",
    "Secret",
    "assets/icons/mysterious.png"
  );
}

function openSecretWindowBody() {
  return `
    <div
      class="win-content"
      style="
        background:#000;
        color:#00ff66;
        font-family:monospace;
        display:flex;
        align-items:center;
        justify-content:center;
        text-align:center;
        min-height:200px;
      "
    >

      <div>

        <div
          style="
            font-size:18px;
            margin-bottom:12px;
          "
        >
          ACCESSING SECRET DIRECTORY...
        </div>

        <div
          style="
            font-size:11px;
            color:#777;
            margin-bottom:20px;
          "
        >
          SYSTEM ID: ISHA-OS
        </div>

        <button
          class="win-btn"
          data-action="secret-open"
        >
          OPEN SECRET
        </button>

        <div
          data-role="secret-message"
          style="
            display:none;
            max-width:380px;
            font-size:13px;
            line-height:1.7;
            text-align:left;
            white-space:pre-wrap;
          "
        ></div>

      </div>

    </div>
  `;
}

function typeSecretMessage(
  element
) {
  const text =
`you found it.

there wasn't supposed to be
anything here.

but since you're here...

i love you.

more than this stupid
computer can possibly explain.`;

  let i = 0;

  function step() {

    if (
      !document.body.contains(
        element
      )
    ) {
      return;
    }

    if (
      i <= text.length
    ) {

      element.textContent =
        text.slice(
          0,
          i
        );

      i++;

      setTimeout(
        step,
        35
      );
    }
  }

  step();
}

/* ==========================================================================
   PHOTOS
   ========================================================================== */

function openPhotosViewerWindowBody() {
  return `
    <div
      class="win-content"
      data-role="photo-content"
    >

      <img
        class="photo-viewer-img"
        data-role="photo-img"
        src="${PHOTOS[0]}"
        alt="Placeholder photo"
      >

      <div
        class="photo-nav"
      >

        <button
          class="win-btn"
          data-action="prev"
        >
          &larr; Prev
        </button>

        <button
          class="win-btn"
          data-action="next"
        >
          Next &rarr;
        </button>

      </div>

    </div>

    <div
      class="win-statusbar"
      data-role="photo-status"
    >
      Photo 1 of ${
        PHOTOS.length
      }
    </div>
  `;
}

/* ==========================================================================
   SPECIAL WINDOW CONTENT
   ========================================================================== */

const _originalGetWindowContent =
  getWindowContent;

getWindowContent =
  function (appId) {

    if (
      appId ===
      "photos-viewer"
    ) {
      return openPhotosViewerWindowBody();
    }

    if (
      appId ===
      "letters-folder"
    ) {
      return openLettersWindowBody();
    }

    if (
      appId.startsWith(
        "letter-"
      )
    ) {

      const fileName =
        appId.slice(
          "letter-".length
        );

      const letter =
        LETTERS.find(
          (item) =>
            item.name ===
            fileName
        );

      if (letter) {
        return openLetterWindowBody(
          letter
        );
      }
    }

    if (
      appId ===
      "music-folder"
    ) {
      return openMusicFolderWindowBody();
    }

    if (
      appId ===
      "random-folder"
    ) {
      return openRandomFolderWindowBody();
    }

    if (
      appId ===
      "random-photo"
    ) {
      return openRandomPhotoWindowBody();
    }

    if (
      appId ===
      "secret-folder"
    ) {
      return openSecretWindowBody();
    }

    return _originalGetWindowContent(
      appId
    );
  };

/* ==========================================================================
   SPECIAL APP BEHAVIOR
   ========================================================================== */

const _originalInitAppBehavior =
  initAppBehavior;

initAppBehavior =
  function (
    appId,
    winEl,
    winId
  ) {

    _originalInitAppBehavior(
      appId,
      winEl,
      winId
    );

    /* PHOTOS */

    if (
      appId ===
      "photos-viewer"
    ) {

      let idx = 0;

      const img =
        winEl.querySelector(
          '[data-role="photo-img"]'
        );

      const status =
        winEl.querySelector(
          '[data-role="photo-status"]'
        );

      function update() {

        img.src =
          PHOTOS[idx];

        status.textContent =
          `Photo ${
            idx + 1
          } of ${
            PHOTOS.length
          }`;
      }

      winEl
        .querySelector(
          '[data-action="prev"]'
        )
        .addEventListener(
          "click",
          () => {

            idx =
              (
                idx -
                1 +
                PHOTOS.length
              ) %
              PHOTOS.length;

            update();
          }
        );

      winEl
        .querySelector(
          '[data-action="next"]'
        )
        .addEventListener(
          "click",
          () => {

            idx =
              (
                idx +
                1
              ) %
              PHOTOS.length;

            update();
          }
        );
    }
  };

/* ==========================================================================
   MYSTERIOUS APP
   ========================================================================== */

const MYSTERIOUS_LINES = [
  "welcome back.",
  "",
  "you weren't supposed to find this yet.",
  "",
  "there's more here than it looks like.",
  "keep looking around.",
];

function typeMysteriousText(
  winEl
) {

  const target =
    winEl.querySelector(
      '[data-role="mysterious-text"]'
    );

  const full =
    MYSTERIOUS_LINES.join(
      "\n"
    );

  let i = 0;

  function step() {

    if (
      !document.body.contains(
        winEl
      )
    ) {
      return;
    }

    if (
      i <= full.length
    ) {

      target.textContent =
        full.slice(
          0,
          i
        );

      i++;

      setTimeout(
        step,
        35
      );
    }
  }

  step();
}

/* ==========================================================================
   INIT
   ========================================================================== */

function init() {

  renderDesktopIcons();

  wireStartMenu();

  wireContextMenus();

  wireDialog();

  runBootSequence();

  updateClock();

  setInterval(
    updateClock,
    15000
  );

  setTimeout(
    () => {

      showDialog(
        "System Tray",
        "Your computer might be at risk. (Just kidding.)",
        "info"
      );

    },
    25000
  );
}

document.addEventListener(
  "DOMContentLoaded",
  init
);