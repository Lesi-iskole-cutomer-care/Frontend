// app/api/api.js
// app/api/api.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, options);

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.message || data?.error || `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export function apiGet(path) {
  return request(path, { method: "GET" });
}
export function apiPost(path, body) {
  return request(path, { method: "POST", body });
}
export function apiPut(path, body) {
  return request(path, { method: "PUT", body });
}
export function apiDelete(path) {
  return request(path, { method: "DELETE" });
}
