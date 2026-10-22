const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const url = path.startsWith("/api") ? `${API_BASE}${path}` : path;
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  del: (path) => request(path, { method: "DELETE" }),
};

export function mediaSrc(url) {
  if (!url) return "";
  if (url.startsWith("/uploads") && API_BASE) {
    return `${API_BASE}${url}`;
  }
  return url;
}
