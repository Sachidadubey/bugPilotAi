const API_BASE = "http://localhost:5000/api/v1";

// ── Context menu — right click on selected text ──────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id:       "bugpilot-analyze",
    title:    "🐛 Analyze with BugPilot AI",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "bugpilot-analyze") return;

  const text = info.selectionText?.trim();
  if (!text) return;

  const result = await analyzeText(text);

  // Store result — popup reads this
  await chrome.storage.local.set({
    lastAnalysis: result,
    lastInput:    text,
    timestamp:    Date.now(),
  });

  // Open popup
  chrome.action.openPopup?.();
});

// ── Message listener from popup ───────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "ANALYZE_TEXT") {
    analyzeText(msg.payload.text, msg.payload.language)
      .then(sendResponse)
      .catch((err) => sendResponse({ success: false, message: err.message }));
    return true; // keep channel open for async
  }

  if (msg.type === "GET_PAGE_ERRORS") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "GET_ERRORS" }, sendResponse);
    });
    return true;
  }

  if (msg.type === "LOGIN") {
    loginUser(msg.payload.email, msg.payload.password)
      .then(sendResponse)
      .catch((err) => sendResponse({ success: false, message: err.message }));
    return true;
  }
});

// ── Auth ─────────────────────────────────────────────────────────────────────
async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);

  await chrome.storage.local.set({
    token: data.data.accessToken,
    user:  data.data.user,
  });
  return data.data;
}

// ── AI analyze ───────────────────────────────────────────────────────────────
async function analyzeText(text, language = "unknown") {
  const { token } = await chrome.storage.local.get("token");
  if (!token) throw new Error("Not logged in");

  const res = await fetch(`${API_BASE}/debug/analyze`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      inputType: "text",
      textInput:  text,
      language,
      mode:       "analyze",
    }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
}