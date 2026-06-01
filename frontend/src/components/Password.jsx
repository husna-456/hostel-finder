import { useState } from "react";
import FormAction from "./FormAction";

export default function Password() {
  const [form, setForm] = useState({ email: "" });
  const [message, setMessage] = useState("");

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Handle form submit (send reset link)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await fetch(`${BASE}/password/setpasswordlink`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("Server response:", data);

      if (res.status === 201) {
        setMessage("Password reset link sent successfully to your email!");
        setForm({ email: "" });
      } else {
        setMessage(data.message || "Failed to send reset link.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="mt-10 p-8 bg-white shadow-lg rounded-2xl w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Forgot Your Password?
      </h2>

      {message && (
        <p className="text-center text-green-600 font-medium mb-4">{message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Enter your email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your registered email"
            required
            value={form.email}
            onChange={handleChange}
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <FormAction text="Reset Password" />
      </form>
    </div>
  );
}
