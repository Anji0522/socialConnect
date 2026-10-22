import { handleMockRequest } from "./mockBackend";

const API_BASE = import.meta.env.VITE_API_URL || "";
const isGitHubPages = typeof window !== "undefined" && window.location.hostname.includes("github.io");

async function request(path, options = {}) {
  // If running on GitHub Pages (static host) without an external API URL, use client storage engine
  if (isGitHubPages && !API_BASE) {
    return handleMockRequest(path, options);
  }

  const url = path.startsWith("/api") ? `${API_BASE}${path}` : path;
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // If 404 and no dedicated remote backend is configured, fall back to mock engine
    if (res.status === 404 && !API_BASE) {
      console.warn(`[api] Endpoint ${path} not found on server. Using client store.`);
      return handleMockRequest(path, options);
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  } catch (err) {
    // If backend server is offline or unreachable, fall back gracefully
    if (!API_BASE && (err instanceof TypeError || err.message === "Failed to fetch")) {
      console.warn(`[api] Backend unreachable. Using client store.`);
      return handleMockRequest(path, options);
    }
    throw err;
  }
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
