"use strict";

// Dummy data
const chats = [
  "Planning a trip to Lisbon",
  "Fix my CSS grid layout",
  "Explain quantum entanglement",
  "Weekly meal prep ideas",
  "Draft a cover letter",
  "Learn Python basics",
  "Gift ideas for dad",
  "Summarize a research paper"
];

const replies = [
  "Good question. Let's break it down into small steps and tackle the most important one first.",
  "Here's one way to approach it: start with the goal, list what you already have, then fill in the gaps.",
  "I can help with that. Tell me a bit more about what you're aiming for and I'll tailor the answer.",
  "That's a solid starting point. Next, we could compare a couple of options and pick the best fit."
];

// Elements
const $ = id => document.getElementById(id);
const app = $("app");
const main = $("main");
const chatList = $("chatList");
const noResults = $("noResults");
const searchBox = $("searchBox");
const searchInput = $("searchInput");
const messages = $("messages");
const composer = $("composer");
const inputBox = $("inputBox");
const promptEl = $("prompt");

const mobileMQ = window.matchMedia("(max-width: 767.98px)");
const isMobile = () => mobileMQ.matches;
let activeTitle = null;

/* ---------- Sidebar ---------- */
const closeDrawer = () => app?.classList.remove("drawer-open");

// Desktop: collapse/expand the rail. Mobile: open/close the drawer.
$("collapseBtn")?.addEventListener("click", () => {
  app?.classList.toggle(isMobile() ? "drawer-open" : "collapsed");
});
$("menuBtn")?.addEventListener("click", () => app?.classList.add("drawer-open"));
$("backdrop")?.addEventListener("click", closeDrawer);
$("logoBtn")?.addEventListener("click", () => {
  if (!isMobile()) app?.classList.remove("collapsed");
});
mobileMQ.addEventListener("change", closeDrawer);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });

/* ---------- Search ---------- */
function toggleSearch(force) {
  if (!searchBox) return;
  const open = force ?? searchBox.hidden;
  searchBox.hidden = !open;
  if (open) {
    searchInput?.focus();
  } else if (searchInput) {
    searchInput.value = "";
    renderChats();
  }
}

$("searchBtn")?.addEventListener("click", () => {
  const wasCollapsed = !isMobile() && app?.classList.contains("collapsed");
  app?.classList.remove("collapsed");
  toggleSearch(wasCollapsed ? true : undefined);
});
searchInput?.addEventListener("input", renderChats);
searchInput?.addEventListener("keydown", e => { if (e.key === "Escape") toggleSearch(false); });

/* ---------- Chat list ---------- */
function renderChats() {
  if (!chatList || !searchInput) return;
  const query = searchInput.value.trim().toLowerCase();
  const visible = chats.filter(title => title.toLowerCase().includes(query));

  chatList.innerHTML = "";
  visible.forEach(title => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chat-item" + (title === activeTitle ? " active" : "");
    btn.textContent = title;
    btn.title = title;
    btn.addEventListener("click", () => openChat(title));
    li.appendChild(btn);
    chatList.appendChild(li);
  });
  if (noResults) noResults.hidden = visible.length > 0;
}

function openChat(title) {
  activeTitle = title;
  if (messages) messages.innerHTML = "";
  addMessage("user", title);
  addMessage("ai", "This is a dummy chat. Pick up where you left off by typing below.");
  main?.classList.add("started");
  closeDrawer();
  renderChats();
}

function newChat() {
  activeTitle = null;
  if (messages) messages.innerHTML = "";
  main?.classList.remove("started");
  if (promptEl) {
    promptEl.value = "";
    resizePrompt();
    promptEl.focus();
  }
  closeDrawer();
  renderChats();
}
$("newChat")?.addEventListener("click", newChat);

/* ---------- Messages ---------- */
function scrollToEnd() {
  if (messages) messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
}

function addMessage(role, text) {
  if (!messages) return;
  const row = document.createElement("div");
  row.className = "msg " + role;

  if (role === "ai") {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (text) bubble.textContent = text;
  row.appendChild(bubble);

  messages.appendChild(row);
  scrollToEnd();
  return bubble;
}

function sendMessage() {
  if (!promptEl) return;
  const text = promptEl.value.trim();
  if (!text) return;

  // The first message of a new chat becomes a sidebar entry
  if (activeTitle === null) {
    activeTitle = text.length > 32 ? text.slice(0, 32) + "…" : text;
    chats.unshift(activeTitle);
    renderChats();
  }

  main?.classList.add("started");
  addMessage("user", text);
  promptEl.value = "";
  resizePrompt();

  const bubble = addMessage("ai");
  if (bubble) {
    bubble.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    setTimeout(() => {
      bubble.textContent = replies[Math.floor(Math.random() * replies.length)];
      scrollToEnd();
    }, 1000);
  }
}

/* ---------- Plus Menu Dropdown ---------- */
const plusBtn = $("plusBtn");
const plusMenu = $("plusMenu");

if (plusBtn && plusMenu) {
  plusBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    // Close model menu if open
    $("modelMenu")?.classList.remove("show");
    $("modelSelectBtn")?.closest(".model-selector-wrapper")?.classList.remove("open");
    plusMenu.classList.toggle("show");
  });
}

/* ---------- Model Selector Dropdown ---------- */
const modelSelectBtn = $("modelSelectBtn");
const modelMenu = $("modelMenu");
const selectedModelLabel = $("selectedModelLabel");
const modelOptions = document.querySelectorAll(".model-option");
const modelWrapper = modelSelectBtn?.closest(".model-selector-wrapper");

if (modelSelectBtn && modelMenu) {
  modelSelectBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    // Close plus menu if open
    plusMenu?.classList.remove("show");

    modelMenu.classList.toggle("show");
    modelWrapper?.classList.toggle("open");
  });

  modelOptions.forEach(option => {
    option.addEventListener("click", () => {
      modelOptions.forEach(opt => opt.classList.remove("active"));
      option.classList.add("active");

      const modelName = option.getAttribute("data-model");
      if (selectedModelLabel && modelName) {
        selectedModelLabel.textContent = modelName;
      }

      modelMenu.classList.remove("show");
      modelWrapper?.classList.remove("open");
    });
  });
}

/* ---------- Global Click Listener (Close Menus) ---------- */
document.addEventListener("click", (e) => {
  if (plusMenu && !plusMenu.contains(e.target) && plusBtn && !plusBtn.contains(e.target)) {
    plusMenu.classList.remove("show");
  }
  if (modelMenu && !modelMenu.contains(e.target) && modelSelectBtn && !modelSelectBtn.contains(e.target)) {
    modelMenu.classList.remove("show");
    modelWrapper?.classList.remove("open");
  }
});

/* ---------- Composer (Input Auto-resize & Send Trigger) ---------- */
function resizePrompt() {
  if (!promptEl || !inputBox) return;
  
  // Height calculation
  promptEl.style.height = "auto";
  promptEl.style.height = Math.min(promptEl.scrollHeight, 180) + "px";
  
  // White scrollbar box fix for textarea
  promptEl.style.overflowY = promptEl.scrollHeight > 180 ? "auto" : "hidden";
  
  // Show/Hide Send button on typing
  inputBox.classList.toggle("has-text", promptEl.value.trim() !== "");
}

if (promptEl) {
  promptEl.addEventListener("input", resizePrompt);
  promptEl.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  });
}

if (composer) {
  composer.addEventListener("submit", e => {
    e.preventDefault();
    sendMessage();
  });
}

// Initial renders
renderChats();

/* ========================================================
   FORCE MOVE MODEL SELECTOR TO TOP-LEFT IN MOBILE
   ======================================================== */
function fixModelSelectorPosition() {
  const modelSelector = document.querySelector('.model-selector-wrapper');
  const topbar = document.querySelector('.topbar');
  const inputBox = document.getElementById('inputBox');
  const menuBtn = document.getElementById('menuBtn');

  if (!modelSelector || !topbar || !inputBox) return;

  const isMobileView = window.innerWidth <= 767.98;

  if (isMobileView) {
    // Mobile View: Topbar mein Menu Button ke saath attach karo
    if (!topbar.contains(modelSelector)) {
      if (menuBtn && menuBtn.nextSibling) {
        topbar.insertBefore(modelSelector, menuBtn.nextSibling);
      } else {
        topbar.appendChild(modelSelector);
      }
    }
  } else {
    // PC View: Input Box mein Model Selector wapis lao
    if (!inputBox.contains(modelSelector)) {
      const promptEl = document.getElementById('prompt');
      if (promptEl && promptEl.nextSibling) {
        inputBox.insertBefore(modelSelector, promptEl.nextSibling);
      } else {
        inputBox.appendChild(modelSelector);
      }
    }
  }
}

// Immediately Run on DOM Load and Window Resize
document.addEventListener('DOMContentLoaded', fixModelSelectorPosition);
window.addEventListener('resize', fixModelSelectorPosition);
fixModelSelectorPosition(); // Instant execution