const https = require("https");
const http  = require("http");

function callApi(apiUrl, token, body) {
  return new Promise((resolve, reject) => {
    const url  = new URL(`${apiUrl}/debug/analyze`);
    const data = JSON.stringify(body);
    const mod  = url.protocol === "https:" ? https : http;

    const req = mod.request({
      hostname: url.hostname,
      port:     url.port || (url.protocol === "https:" ? 443 : 80),
      path:     url.pathname,
      method:   "POST",
      headers: {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(data),
        "Authorization":  `Bearer ${token}`,
      },
    }, (res) => {
      let raw = "";
      res.on("data", (c) => raw += c);
      res.on("end", () => {
        try { resolve(JSON.parse(raw)); }
        catch { reject(new Error("Invalid JSON response from server")); }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

module.exports = { callApi };