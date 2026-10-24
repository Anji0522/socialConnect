import { handleMockRequest } from "./mockBackend";

const API_BASE = import.meta.env.VITE_API_URL || "";
const isGitHubPages = typeof window !== "undefined" && window.location.hostname.includes("github.io");

export function getStoredToken() {
  try {
    return localStorage.getItem("sc_access_token");
  } catch {
    return null;
  }
}

export function setStoredTokens(accessToken, refreshToken) {
  try {
    if (accessToken) localStorage.setItem("sc_access_token", accessToken);
    if (refreshToken) localStorage.setItem("sc_refresh_token", refreshToken);
  } catch {
    // ignore
  }
}

export function clearStoredTokens() {
  try {
    localStorage.removeItem("sc_access_token");
    localStorage.removeItem("sc_refresh_token");
  } catch {
    // ignore
  }
}

let isRefreshing = false;
let refreshQueue = [];

async function request(path, options = {}, isRetry = false) {
  // If running on GitHub Pages (static host) without an external API URL, use client storage engine
  if (isGitHubPages && !API_BASE) {
    return handleMockRequest(path, options);
  }

  const url = path.startsWith("/api") ? `${API_BASE}${path}` : path;
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // Save tokens if returned in body
    if (res.status === 401 && !isRetry && !path.includes("/api/auth/login") && !path.includes("/api/auth/refresh")) {
      const refreshToken = localStorage.getItem("sc_refresh_token");
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ refreshToken }),
            });
            const refreshData = await refreshRes.json();
            if (refreshRes.ok && refreshData.accessToken) {
              setStoredTokens(refreshData.accessToken, refreshData.refreshToken);
              isRefreshing = false;
              refreshQueue.forEach((cb) => cb());
              refreshQueue = [];
              return request(path, options, true);
            }
          } catch {
            clearStoredTokens();
          } finally {
            isRefreshing = false;
          }
        } else {
          return new Promise((resolve, reject) => {
            refreshQueue.push(() => {
              request(path, options, true).then(resolve).catch(reject);
            });
          });
        }
      }
    }

    // If 404 and no dedicated remote backend is configured, fall back to mock engine
    if (res.status === 404 && !API_BASE) {
      console.warn(`[api] Endpoint ${path} not found on server. Using client store.`);
      return handleMockRequest(path, options);
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }

    if (data.accessToken) {
      setStoredTokens(data.accessToken, data.refreshToken);
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
