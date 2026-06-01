// utils/api.js
export const API = async (url, method = "GET", body = null) => {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : null
  });

  // Yeh line sabse important hai — pehle text padho, phir parse karo
  

 let data;

  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid JSON response");
  }

  if (!res.ok) {
    const msg = data.message || data.error || "Request failed";
    throw new Error(msg);
  }

  return data;
};