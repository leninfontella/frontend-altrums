// assets/js/apiService.js
const API_BASE_URL = "https://api-backend-coins.onrender.com/api";

let apiCache = new Map();
let lastApiCall = 0;
const API_COOLDOWN = 2000;

export async function apiRequest(endpoint, options = {}) {
  try {
    const now = Date.now();

    if (now - lastApiCall < API_COOLDOWN) {
      await new Promise((resolve) =>
        setTimeout(resolve, API_COOLDOWN - (now - lastApiCall))
      );
    }

    const token = Auth.getToken();
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    lastApiCall = Date.now();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    const contentType = response.headers.get("content-type");
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) throw new Error(data.message || response.statusText);
    return data;
  } catch (err) {
    console.error("Erro API:", err);
    throw err;
  }
}
