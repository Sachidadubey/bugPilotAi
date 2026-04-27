// Captures console errors on the page
const pageErrors = [];

// Override console.error to capture errors
const originalError = console.error;
console.error = (...args) => {
  pageErrors.push({
    message:   args.join(" "),
    timestamp: new Date().toISOString(),
  });
  originalError.apply(console, args);
};

// Capture unhandled JS errors
window.addEventListener("error", (e) => {
  pageErrors.push({
    message:  e.message,
    filename: e.filename,
    line:     e.lineno,
    col:      e.colno,
    timestamp: new Date().toISOString(),
  });
});

// Capture unhandled promise rejections
window.addEventListener("unhandledrejection", (e) => {
  pageErrors.push({
    message:   `Unhandled Promise: ${e.reason}`,
    timestamp: new Date().toISOString(),
  });
});

// Respond to popup requests
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_ERRORS") {
    sendResponse({ errors: pageErrors });
  }
});