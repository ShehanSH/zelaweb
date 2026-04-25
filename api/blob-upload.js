const { put } = require("@vercel/blob");

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Method not allowed" }));
    }

    const u = new URL(req.url, `https://${req.headers.host}`);
    const filename = u.searchParams.get("filename") || "upload.bin";
    const contentType = req.headers["content-type"] || "application/octet-stream";

    const body = await readRequestBody(req);
    if (!body || body.length === 0) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Empty body" }));
    }

    // Public access is simplest for product images:
    // You store the returned url in Firestore and show it to customers.
    const blob = await put(`products/${Date.now()}-${filename}`.replace(/\s+/g, "_"), body, {
      access: "public",
      contentType
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify(blob));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: e?.message || "Upload failed" }));
  }
};

