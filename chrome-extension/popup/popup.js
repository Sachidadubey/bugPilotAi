// ── State ─────────────────────────────────────────────────────────────────────
let currentUser = null;

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  const { token, user, lastAnalysis } = await chrome.storage.local.get([
    "token", "user", "lastAnalysis",
  ]);

  if (token && user) {
    currentUser = user;
    showMain(user);
    if (lastAnalysis?.success) renderResult(lastAnalysis.data);
  } else {
    showAuth();
  }
}

function showAuth() {
  document.getElementById("authSection").style.display = "flex";
  document.getElementById("mainSection").style.display = "none";
}

function showMain(user) {
  document.getElementById("authSection").style.display  = "none";
  document.getElementById("mainSection").style.display  = "block";
  document.getElementById("userName").textContent        = user.name;
  document.getElementById("userEmail").textContent       = user.email;
  document.getElementById("userAvatar").textContent      = user.name?.[0]?.toUpperCase() || "U";
  const pill = document.getElementById("planPill");
  if (user.subscription === "pro") {
    pill.textContent = "⚡ Pro";
    pill.classList.add("pro");
  } else {
    pill.textContent = "Free";
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email    = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value;
  const btn      = document.getElementById("loginBtn");
  const errWrap  = document.getElementById("authErr");
  const errMsg   = document.getElementById("authErrMsg");

  if (!email || !password) { showErr(errWrap, errMsg, "Enter email and password"); return; }

  btn.textContent = "Signing in...";
  btn.disabled    = true;
  errWrap.style.display = "none";

  try {
    const data = await chrome.runtime.sendMessage({
      type: "LOGIN", payload: { email, password },
    });
    if (!data.success) throw new Error(data.message);
    currentUser = data.user;
    showMain(data.user);
  } catch (err) {
    showErr(errWrap, errMsg, err.message || "Login failed. Check credentials.");
  } finally {
    btn.innerHTML = "<span>🔐</span> Sign In";
    btn.disabled  = false;
  }
});

function showErr(wrap, msg, text) {
  msg.textContent   = text;
  wrap.style.display = "flex";
}

document.getElementById("passwordInput").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("loginBtn").click();
});

// ── Logout ────────────────────────────────────────────────────────────────────
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await chrome.storage.local.remove(["token", "user", "lastAnalysis"]);
  document.getElementById("resultWrap").innerHTML = "";
  document.getElementById("textInput").value = "";
  showAuth();
});

// ── Tabs ──────────────────────────────────────────────────────────────────────
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("tabAnalyze").style.display =
      tab.dataset.tab === "analyze" ? "block" : "none";
    document.getElementById("tabErrors").style.display  =
      tab.dataset.tab === "errors"  ? "block" : "none";
  });
});

// ── Input type buttons ────────────────────────────────────────────────────────
const labels = { code: "Code Snippet", text: "Error Message", log: "Log Content" };
document.querySelectorAll(".type-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("inputLabel").textContent =
      labels[btn.dataset.type] || "Input";
    const ph = {
      code: "Paste your buggy code here...",
      text: "Paste the error message...",
      log:  "Paste log file content...",
    };
    document.getElementById("textInput").placeholder = ph[btn.dataset.type] || "";
  });
});

// ── Char count ────────────────────────────────────────────────────────────────
document.getElementById("textInput").addEventListener("input", e => {
  document.getElementById("charCount").textContent = e.target.value.length;
});

// ── Clear ─────────────────────────────────────────────────────────────────────
document.getElementById("clearBtn").addEventListener("click", () => {
  document.getElementById("textInput").value       = "";
  document.getElementById("charCount").textContent = "0";
  document.getElementById("resultWrap").innerHTML  = "";
});

// ── Analyze ───────────────────────────────────────────────────────────────────
document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const text = document.getElementById("textInput").value.trim();
  const lang = document.getElementById("langSelect").value;

  if (!text) {
    document.getElementById("resultWrap").innerHTML =
      `<div class="err-alert"><span class="err-icon">⚠</span>Enter some code or error text first</div>`;
    return;
  }

  showLoading(true);
  document.getElementById("resultWrap").innerHTML = "";

  try {
    const res = await chrome.runtime.sendMessage({
      type: "ANALYZE_TEXT", payload: { text, language: lang },
    });
    if (!res.success) throw new Error(res.message);
    renderResult(res.data);
    await chrome.storage.local.set({ lastAnalysis: res });
  } catch (err) {
    document.getElementById("resultWrap").innerHTML =
      `<div class="err-alert"><span class="err-icon">⚠</span>${err.message}</div>`;
  } finally {
    showLoading(false);
  }
});

// ── Grab page errors ──────────────────────────────────────────────────────────
document.getElementById("grabBtn").addEventListener("click", async () => {
  const wrap = document.getElementById("errorsListWrap");

  try {
    const res = await chrome.runtime.sendMessage({ type: "GET_PAGE_ERRORS" });
    if (!res?.errors?.length) {
      wrap.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <div class="empty-text">No errors detected on this page</div>
        </div>`;
      return;
    }

    wrap.innerHTML = res.errors.slice(0, 5).map((e, i) => `
      <div class="error-item" data-idx="${i}" data-msg="${encodeURIComponent(e.message)}">
        <div class="error-item-msg">${truncate(e.message, 100)}</div>
        <div class="error-item-meta">
          ${e.filename ? e.filename.split("/").pop() + ":" + e.line : e.timestamp}
        </div>
      </div>
    `).join("");

    wrap.querySelectorAll(".error-item").forEach(el => {
      el.addEventListener("click", () => {
        document.getElementById("textInput").value = decodeURIComponent(el.dataset.msg);
        document.getElementById("charCount").textContent =
          document.getElementById("textInput").value.length;
        document.querySelector('[data-tab="analyze"]').click();
      });
    });
  } catch {
    wrap.innerHTML = `<div class="err-alert"><span class="err-icon">⚠</span>Could not access page. Try refreshing.</div>`;
  }
});

// ── Render result ─────────────────────────────────────────────────────────────
function renderResult(data) {
  const a   = data?.analysis;
  const el  = document.getElementById("resultWrap");
  if (!a)   { el.innerHTML = `<div class="err-alert"><span>⚠</span>No result returned</div>`; return; }

  const sevBadge = a.severity
    ? `<span class="sev-badge sev-${a.severity}">${a.severity}</span>` : "";

  let html = `<div class="result-wrap">`;

  if (a.rootCause) html += `
    <div class="result-card root">
      <div class="card-label red">🎯 Root Cause ${sevBadge}</div>
      <div class="card-text">${esc(a.rootCause)}</div>
    </div>`;

  if (a.explanation) html += `
    <div class="result-card explain">
      <div class="card-label yellow">📖 Explanation</div>
      <div class="card-text">${esc(a.explanation)}</div>
    </div>`;

  if (a.solution) html += `
    <div class="result-card solution">
      <div class="card-label green">✅ Solution</div>
      <div class="card-text">${esc(a.solution)}</div>
    </div>`;

  if (a.codeSnippet) html += `
    <div class="result-card code">
      <div class="card-label purple">💻 Fixed Code</div>
      <div class="code-pre" id="codeBlock">
        <button class="copy-btn" onclick="doCopy()">Copy</button>${esc(a.codeSnippet)}
      </div>
    </div>`;

  if (a.tags?.length) html += `
    <div class="tags-row">
      ${a.tags.map(t => `<span class="tag">#${t}</span>`).join("")}
    </div>`;

  html += `
    <div class="meta-row">
      <span class="token-count">⚡ ${data.tokensUsed || 0} tokens used</span>
    </div>
  </div>`;

  el.innerHTML = html;
}

function showLoading(show) {
  document.getElementById("loadingWrap").style.display = show ? "flex" : "none";
  document.getElementById("analyzeBtn").disabled = show;
  document.getElementById("analyzeBtn").innerHTML = show
    ? "Analyzing..." : "🔍 Analyze with AI";
}

function esc(str) {
  return String(str || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function truncate(str, n) {
  return str?.length > n ? str.slice(0, n) + "..." : str;
}

window.doCopy = async () => {
  const code = document.getElementById("codeBlock")?.innerText
    ?.replace("Copy","").replace("Copied!","").trim();
  await navigator.clipboard.writeText(code || "");
  document.querySelector(".copy-btn").textContent = "Copied!";
  setTimeout(() => document.querySelector(".copy-btn").textContent = "Copy", 2000);
};

init();