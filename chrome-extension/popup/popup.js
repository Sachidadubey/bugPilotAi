// ── State ─────────────────────────────────────────────────────────────────────
let currentUser  = null;
let currentToken = null;

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  const { token, user, lastAnalysis } = await chrome.storage.local.get([
    "token", "user", "lastAnalysis",
  ]);

  if (token && user) {
    currentToken = token;
    currentUser  = user;
    showMain(user);

    // Show last analysis if recent (within 5 min)
    if (lastAnalysis && lastAnalysis.success) {
      renderResult(lastAnalysis.data);
    }
  } else {
    showAuth();
  }
}

// ── Show/hide sections ────────────────────────────────────────────────────────
function showAuth() {
  document.getElementById("authSection").style.display = "block";
  document.getElementById("mainSection").style.display = "none";
}

function showMain(user) {
  document.getElementById("authSection").style.display = "none";
  document.getElementById("mainSection").style.display = "block";
  document.getElementById("userName").textContent    = user.name;
  document.getElementById("userAvatar").textContent  = user.name?.[0]?.toUpperCase();
  document.getElementById("planBadge").textContent   =
    user.subscription === "pro" ? "⚡ Pro" : "Free";
}

// ── Login ─────────────────────────────────────────────────────────────────────
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email    = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value;
  const errEl    = document.getElementById("authError");

  if (!email || !password) { showAuthError("Enter email and password"); return; }

  document.getElementById("loginBtn").textContent = "Signing in...";
  document.getElementById("loginBtn").disabled    = true;

  try {
    const data = await chrome.runtime.sendMessage({
      type: "LOGIN", payload: { email, password },
    });

    if (!data.success) throw new Error(data.message);

    currentToken = data.accessToken;
    currentUser  = data.user;
    errEl.style.display = "none";
    showMain(data.user);
  } catch (err) {
    showAuthError(err.message || "Login failed");
  } finally {
    document.getElementById("loginBtn").textContent = "Sign In";
    document.getElementById("loginBtn").disabled    = false;
  }
});

function showAuthError(msg) {
  const el = document.getElementById("authError");
  el.textContent    = msg;
  el.style.display  = "block";
}

// ── Logout ────────────────────────────────────────────────────────────────────
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await chrome.storage.local.remove(["token", "user", "lastAnalysis"]);
  currentToken = null;
  currentUser  = null;
  showAuth();
  document.getElementById("result").innerHTML = "";
});

// ── Tabs ──────────────────────────────────────────────────────────────────────
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const tabName = tab.dataset.tab;
    document.getElementById("tabAnalyze").style.display =
      tabName === "analyze" ? "block" : "none";
    document.getElementById("tabErrors").style.display  =
      tabName === "errors"  ? "block" : "none";
  });
});

// ── Analyze ───────────────────────────────────────────────────────────────────
document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const text = document.getElementById("textInput").value.trim();
  const lang = document.getElementById("langSelect").value;

  if (!text) { alert("Enter some code or error text"); return; }

  showLoading(true);
  document.getElementById("result").innerHTML = "";

  try {
    const res = await chrome.runtime.sendMessage({
      type: "ANALYZE_TEXT", payload: { text, language: lang },
    });

    if (!res.success) throw new Error(res.message);
    renderResult(res.data);
    await chrome.storage.local.set({ lastAnalysis: res });
  } catch (err) {
    document.getElementById("result").innerHTML =
      `<div class="alert-error">${err.message}</div>`;
  } finally {
    showLoading(false);
  }
});

document.getElementById("clearBtn").addEventListener("click", () => {
  document.getElementById("textInput").value  = "";
  document.getElementById("result").innerHTML = "";
});

// ── Grab page errors ──────────────────────────────────────────────────────────
document.getElementById("grabErrorsBtn").addEventListener("click", async () => {
  const res = await chrome.runtime.sendMessage({ type: "GET_PAGE_ERRORS" });
  const list = document.getElementById("errorsList");

  if (!res?.errors?.length) {
    list.innerHTML = `<p style="color:#6b7280;font-size:12px;text-align:center;padding:16px">
      No errors detected on this page</p>`;
    return;
  }

  list.innerHTML = res.errors.slice(0, 5).map((e, i) => `
    <div class="error-item" data-msg="${encodeURIComponent(e.message)}" data-idx="${i}">
      <p>${e.message?.slice(0, 100)}${e.message?.length > 100 ? "..." : ""}</p>
      <span>${e.filename ? e.filename.split("/").pop() + ":" + e.line : e.timestamp}</span>
    </div>
  `).join("");

  // Click error → paste into analyze tab
  list.querySelectorAll(".error-item").forEach(el => {
    el.addEventListener("click", () => {
      const msg = decodeURIComponent(el.dataset.msg);
      document.getElementById("textInput").value = msg;
      // Switch to analyze tab
      document.querySelector('[data-tab="analyze"]').click();
    });
  });
});

// ── Render result ─────────────────────────────────────────────────────────────
function renderResult(data) {
  const a   = data?.analysis;
  const el  = document.getElementById("result");
  if (!a)   { el.innerHTML = "<div class='alert-error'>No analysis data</div>"; return; }

  const sevClass = `sev-${a.severity || "medium"}`;

  el.innerHTML = `
    ${a.rootCause ? `
    <div class="result-card ${sevClass}">
      <div class="result-label">🎯 Root Cause</div>
      <div class="result-text">${a.rootCause}</div>
    </div>` : ""}

    ${a.solution ? `
    <div class="result-card">
      <div class="result-label">✅ Solution</div>
      <div class="result-text">${a.solution}</div>
    </div>` : ""}

    ${a.codeSnippet ? `
    <div class="result-card">
      <div class="result-label">💻 Fixed Code</div>
      <div class="code-result" id="codeResult">
        <button class="copy-btn" onclick="copyCode()">Copy</button>
        ${escapeHtml(a.codeSnippet)}
      </div>
    </div>` : ""}

    ${a.tags?.length ? `
    <div class="tags">
      ${a.tags.map(t => `<span class="tag">#${t}</span>`).join("")}
    </div>` : ""}

    <div style="text-align:right;margin-top:6px">
      <span style="font-size:10px;color:#9ca3af">${data.tokensUsed || 0} tokens</span>
    </div>
  `;
}

function showLoading(show) {
  document.getElementById("analyzeLoading").style.display = show ? "block" : "none";
  document.getElementById("analyzeBtn").disabled = show;
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

window.copyCode = async () => {
  const code = document.getElementById("codeResult")?.innerText
    ?.replace("Copy","").trim();
  await navigator.clipboard.writeText(code || "");
  document.querySelector(".copy-btn").textContent = "✓ Copied";
  setTimeout(() => document.querySelector(".copy-btn").textContent = "Copy", 1500);
};

// Enter key to login
document.getElementById("passwordInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("loginBtn").click();
});

init();