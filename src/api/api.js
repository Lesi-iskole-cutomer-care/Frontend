// src/api/api.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const USER_KEY = "lesicc_logged_user_web";

export function setStoredUser(user) {
  try {
    if (!user) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}

export function clearStoredUser() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {}
}

function getStoredUserId() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return "";
    const user = JSON.parse(raw);
    return user?._id || user?.id || "";
  } catch {
    return "";
  }
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const userId = getStoredUserId();

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
      ...headers,
    },
    credentials: "include",
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, options);

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const apiGet = (path) => request(path, { method: "GET" });
export const apiPost = (path, body) => request(path, { method: "POST", body });
export const apiPut = (path, body) => request(path, { method: "PUT", body });
export const apiDelete = (path) => request(path, { method: "DELETE" });