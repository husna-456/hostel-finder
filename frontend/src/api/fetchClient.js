import { getToken } from "../utils/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const fetchClient = async (url, options = {}) => {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  const contentType = res.headers.get("content-type");

  // ❌ Not JSON (HTML error page etc.)
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    throw {
      message: "Server did not return JSON",
      status: res.status,
      response: text,
    };
  }

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
};
