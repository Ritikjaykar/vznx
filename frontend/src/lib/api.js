// ✅ frontend/src/lib/api.js

export const BASE_URL = "https://vznx-fu2q.onrender.com/api";

export async function http(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, config);

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ HTTP Error:", res.status, text);
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
