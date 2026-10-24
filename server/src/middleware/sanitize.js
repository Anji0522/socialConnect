/**
 * Deep sanitization middleware for NoSQL injection prevention and basic XSS hygiene.
 * Recursively removes keys beginning with '$' or containing '.' and cleans string inputs.
 */
function cleanValue(val) {
  if (val === null || val === undefined) return val;
  if (typeof val === "string") {
    // Strip dangerous script tags and null bytes
    return val.replace(/\0/g, "").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  }
  if (Array.isArray(val)) {
    return val.map(cleanValue);
  }
  if (typeof val === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(val)) {
      if (key.startsWith("$") || key.includes(".")) {
        continue; // Discard MongoDB operator injections
      }
      cleaned[key] = cleanValue(value);
    }
    return cleaned;
  }
  return val;
}

export function sanitizeInput(req, _res, next) {
  if (req.body && typeof req.body === "object" && !(req.body instanceof Buffer)) {
    req.body = cleanValue(req.body);
  }
  if (req.params && typeof req.params === "object") {
    req.params = cleanValue(req.params);
  }
  if (req.query && typeof req.query === "object") {
    try {
      const cleaned = cleanValue(req.query);
      Object.defineProperty(req, "query", {
        value: cleaned,
        writable: true,
        configurable: true,
      });
    } catch {
      // In Express 5 req.query might be read-only getter if not redefined
    }
  }
  next();
}
