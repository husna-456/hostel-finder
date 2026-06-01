import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormAction from "./FormAction";

export default function Forget() {
  const { id, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Validate user token on page load
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const res = await fetch(
          `${BASE}/password/forget-password/${id}/${token}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        const data = await res.json();
        console.log("Token verification response:", data);

        if (res.status !== 200) {
          alert("Link expired or invalid. Please request again.");
          navigate("/login");
        }
      } catch (err) {
        console.error("Error verifying user:", err);
        navigate("/login");
      }
    };

    verifyUser();
  }, [id, token, navigate]);

  // ✅ Send new password to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await fetch(
        `${BASE}/password/reset/${id}/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();
      console.log("Server Response:", res.status, data);

      if (res.status === 200) {
       navigate("/password-success");
      } else {
        setMessage(data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="mt-10 p-8 bg-white shadow-lg rounded-2xl w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Reset Your Password
      </h2>

      {message && (
        <p className="text-center text-green-600 font-medium mb-4">{message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter new password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <FormAction text="Update Password" />
      </form>
    </div>
  );
}
